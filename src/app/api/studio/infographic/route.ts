import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateInfographicImage } from "@/lib/ai/nano-banana";
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

    const { notebookId, language, orientation, detailLevel, prompt } =
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
        { error: "활성화된 소스가 없습니다. 소스를 추가하고 활성화해주세요." },
        { status: 400 }
      );
    }

    // Create studio output record (generating status)
    const { data: output, error: insertError } = await supabase
      .from("studio_outputs")
      .insert({
        notebook_id: notebookId,
        user_id: user.id,
        type: "infographic",
        title: `인포그래픽 - ${new Date().toLocaleDateString("ko-KR")}`,
        settings: { language, orientation, detailLevel, prompt },
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
        // Summarize sources for infographic content
        const sourceTexts = sources
          .map((s) => `[${s.title}]\n${(s.extracted_text || "").slice(0, 5000)}`)
          .join("\n\n");

        const sourceContent = await generateText(
          `다음 소스 내용에서 인포그래픽에 포함할 핵심 데이터 포인트, 통계, 주요 개념을 추출하세요. 글머리 기호로 정리해주세요:\n\n${sourceTexts.slice(0, 20000)}`
        );

        // Generate infographic image
        const { imageData, mimeType } = await generateInfographicImage({
          sourceContent,
          language,
          orientation,
          detailLevel,
          userPrompt: prompt,
        });

        // Upload image to storage
        const ext = mimeType.includes("png") ? "png" : "jpg";
        const filePath = `${user.id}/outputs/${output.id}.${ext}`;
        const imageBuffer = Buffer.from(imageData, "base64");

        await supabase.storage
          .from("sources")
          .upload(filePath, imageBuffer, {
            contentType: mimeType,
          });

        const {
          data: { publicUrl },
        } = supabase.storage.from("sources").getPublicUrl(filePath);

        // Update output with image URL
        await supabase
          .from("studio_outputs")
          .update({
            image_urls: [publicUrl],
            generation_status: "completed",
          })
          .eq("id", output.id);
      } catch (error) {
        console.error("Infographic generation error:", error);
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
    console.error("Infographic API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
