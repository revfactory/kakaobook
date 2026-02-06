import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateSlideImage } from "@/lib/ai/nano-banana";
import { generateText } from "@/lib/ai/gemini";

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

    // Generate in background
    (async () => {
      try {
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

        // Determine topic
        const topic = slides[0]?.title || "프레젠테이션";

        // Generate images sequentially (to respect rate limits)
        const imageUrls: string[] = [];

        for (let i = 0; i < slides.length; i++) {
          const slide = slides[i];

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
          const filePath = `${user.id}/outputs/${output.id}-slide-${i + 1}.${ext}`;
          const imageBuffer = Buffer.from(imageData, "base64");

          await supabase.storage
            .from("sources")
            .upload(filePath, imageBuffer, { contentType: mimeType });

          const {
            data: { publicUrl },
          } = supabase.storage.from("sources").getPublicUrl(filePath);

          imageUrls.push(publicUrl);
        }

        // Update output
        await supabase
          .from("studio_outputs")
          .update({
            image_urls: imageUrls,
            content: { slides },
            generation_status: "completed",
          })
          .eq("id", output.id);
      } catch (error) {
        console.error("Slide generation error:", error);
        await supabase
          .from("studio_outputs")
          .update({
            generation_status: "failed",
            error_message:
              error instanceof Error ? error.message : "생성 실패",
          })
          .eq("id", output.id);
      }
    })();

    return NextResponse.json({ id: output.id, status: "generating" });
  } catch (error) {
    console.error("Slides API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
