import { NextResponse, after } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { generateSlideImage } from "@/lib/ai/nano-banana";
import { generateText } from "@/lib/ai/gemini";

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const index = nextIndex++;
      try {
        const value = await tasks[index]();
        results[index] = { status: "fulfilled", value };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, tasks.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notebookId, format, language, depth, prompt } =
      await request.json();

    if (!notebookId) {
      return NextResponse.json(
        { error: "노트북 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // Get enabled sources
    const { data: sources } = await supabase
      .from("sources")
      .select("id, title, extracted_text")
      .eq("notebook_id", notebookId)
      .eq("is_enabled", true)
      .eq("processing_status", "completed");

    if (!sources || sources.length === 0) {
      return NextResponse.json(
        { error: "활성화된 소스가 없습니다." },
        { status: 400 }
      );
    }

    // Create studio output record
    const { data: output, error: insertError } = await supabase
      .from("studio_outputs")
      .insert({
        notebook_id: notebookId,
        user_id: user.id,
        type: "slide_deck",
        title: `슬라이드 - ${new Date().toLocaleDateString("ko-KR")}`,
        settings: { format, language, depth, prompt },
        generation_status: "generating",
        source_ids: sources.map((s) => s.id),
      })
      .select()
      .single();

    if (insertError || !output) {
      return NextResponse.json(
        { error: "출력 레코드 생성 실패" },
        { status: 500 }
      );
    }

    // Generate in background using after() to keep serverless function alive
    const adminClient = await createServiceRoleClient();
    const outputId = output.id;
    const userId = user.id;

    after(async () => {
      try {
        console.log(`[Slides ${outputId}] 생성 시작 - 소스 ${sources.length}개`);

        // Update progress: outline phase
        await adminClient
          .from("studio_outputs")
          .update({
            content: {
              progress: { phase: "아웃라인 생성", completed: 0, total: 0, failed: 0 },
            },
          })
          .eq("id", outputId);

        const sourceTexts = sources
          .map(
            (s) => `[${s.title}]\n${(s.extracted_text || "").slice(0, 5000)}`
          )
          .join("\n\n");

        const slideCountRange =
          format === "presenter"
            ? depth === "short"
              ? "4-5"
              : "5-8"
            : depth === "short"
            ? "5-7"
            : "8-12";

        // Generate slide outline with Gemini
        console.log(`[Slides ${outputId}] Gemini 아웃라인 생성 중...`);
        const outlinePrompt = `다음 소스 내용을 기반으로 ${slideCountRange}장의 슬라이드 아웃라인을 JSON 형식으로 생성해주세요.

소스 내용:
${sourceTexts.slice(0, 15000)}

${prompt ? `추가 지시사항: ${prompt}` : ""}

다음 JSON 형식으로 응답해주세요 (코드블록 없이 순수 JSON만):
[
  {"title": "슬라이드 제목", "content": "이 슬라이드의 핵심 내용 (2-3줄)"},
  ...
]`;

        const outlineText = await generateText(outlinePrompt);

        // Parse outline
        let slides: Array<{ title: string; content: string }>;
        try {
          const jsonMatch = outlineText.match(/\[[\s\S]*\]/);
          slides = JSON.parse(jsonMatch?.[0] || outlineText);
        } catch {
          slides = [
            { title: "개요", content: "프레젠테이션 개요 슬라이드입니다." },
          ];
        }
        console.log(`[Slides ${outputId}] 아웃라인 완료 - ${slides.length}장`);

        // Determine topic
        const topic = slides[0]?.title || "프레젠테이션";

        // Update progress: image generation phase starts
        await adminClient
          .from("studio_outputs")
          .update({
            content: {
              slides,
              progress: { phase: "이미지 생성", completed: 0, total: slides.length, failed: 0 },
            },
            image_urls: [],
          })
          .eq("id", outputId);

        // Generate images in parallel (concurrency limit: 3)
        const CONCURRENCY_LIMIT = 3;
        const imageUrls: (string | null)[] = new Array(slides.length).fill(null);
        let completedCount = 0;
        let failedCount = 0;

        const tasks = slides.map((slide, i) => async () => {
          console.log(`[Slides ${outputId}] 슬라이드 ${i + 1}/${slides.length} 이미지 생성 중...`);

          const { imageData, mimeType } = await generateSlideImage({
            slideNumber: i + 1,
            totalSlides: slides.length,
            topic,
            slideTitle: slide.title,
            slideContent: slide.content,
            language,
            format,
            userPrompt: prompt,
          });

          // Upload
          const ext = mimeType.includes("png") ? "png" : "jpg";
          const filePath = `${userId}/outputs/${outputId}-slide-${i + 1}.${ext}`;
          const imageBuffer = Buffer.from(imageData, "base64");

          await adminClient.storage
            .from("studio")
            .upload(filePath, imageBuffer, { contentType: mimeType });

          const {
            data: { publicUrl },
          } = adminClient.storage.from("studio").getPublicUrl(filePath);

          imageUrls[i] = publicUrl;
          completedCount++;

          // Incremental DB update: progress + ordered URLs
          const orderedUrls: string[] = [];
          for (let j = 0; j < slides.length; j++) {
            if (imageUrls[j] !== null) orderedUrls.push(imageUrls[j]!);
          }

          await adminClient
            .from("studio_outputs")
            .update({
              image_urls: orderedUrls,
              content: {
                slides,
                progress: {
                  phase: "이미지 생성",
                  completed: completedCount,
                  total: slides.length,
                  failed: failedCount,
                },
              },
            })
            .eq("id", outputId);

          console.log(`[Slides ${outputId}] 슬라이드 ${i + 1}/${slides.length} 완료 (${completedCount}/${slides.length})`);
          return publicUrl;
        });

        const results = await runWithConcurrency(tasks, CONCURRENCY_LIMIT);

        // Count failures
        const failures = results.filter((r) => r.status === "rejected");
        failedCount = failures.length;

        // Final ordered URLs
        const finalUrls: string[] = [];
        for (let j = 0; j < slides.length; j++) {
          if (imageUrls[j] !== null) finalUrls.push(imageUrls[j]!);
        }

        if (finalUrls.length === 0) {
          throw new Error("모든 슬라이드 이미지 생성에 실패했습니다.");
        }

        // Final update
        await adminClient
          .from("studio_outputs")
          .update({
            image_urls: finalUrls,
            content: {
              slides,
              progress: {
                phase: "완료",
                completed: completedCount,
                total: slides.length,
                failed: failedCount,
              },
            },
            generation_status: "completed",
          })
          .eq("id", outputId);

        console.log(`[Slides ${outputId}] ✅ 전체 생성 완료 - ${finalUrls.length}장 (실패: ${failedCount}장)`);
      } catch (error) {
        console.error(`[Slides ${outputId}] ❌ 생성 실패:`, error);
        await adminClient
          .from("studio_outputs")
          .update({
            generation_status: "failed",
            error_message:
              error instanceof Error ? error.message : "생성 실패",
          })
          .eq("id", outputId);
      }
    });

    return NextResponse.json({ id: output.id, status: "generating" });
  } catch (error) {
    console.error("Slides API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
