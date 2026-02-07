import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateChatResponse } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notebookId, message } = await request.json();

    if (!notebookId || !message) {
      return NextResponse.json(
        { error: "노트북 ID와 메시지가 필요합니다." },
        { status: 400 }
      );
    }

    // Save user message
    await supabase.from("chat_messages").insert({
      notebook_id: notebookId,
      user_id: user.id,
      role: "user" as const,
      content: message,
    });

    // Get enabled sources
    const { data: sources } = await supabase
      .from("sources")
      .select("id, title, extracted_text, type")
      .eq("notebook_id", notebookId)
      .eq("is_enabled", true)
      .eq("processing_status", "completed");

    // Build context from sources
    const sourceContext =
      sources
        ?.map(
          (s, i) =>
            `[소스 ${i + 1}: ${s.title}]\n${(s.extracted_text || "").slice(0, 10000)}`
        )
        .join("\n\n---\n\n") || "소스가 없습니다.";

    // Get chat history
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("notebook_id", notebookId)
      .order("created_at", { ascending: true })
      .limit(20);

    // Remove the last message (the one we just inserted)
    const previousMessages = (history || []).slice(0, -1);

    const systemPrompt = `당신은 KakaoBook AI 어시스턴트입니다. 사용자가 업로드한 소스를 기반으로 질문에 답변합니다.

규칙:
- 소스 내용을 기반으로만 답변하세요.
- 소스에 없는 정보에 대해서는 "소스에서 관련 정보를 찾지 못했습니다"라고 답변하세요.
- 답변 시 관련 소스를 인용하세요 (예: [소스 1] 참고).
- 한국어로 답변하되, 사용자가 다른 언어로 질문하면 해당 언어로 답변하세요.
- 마크다운 형식을 사용하여 구조화된 답변을 제공하세요.

사용 가능한 소스:
${sourceContext}`;

    // Generate streaming response
    const stream = await generateChatResponse(
      systemPrompt,
      previousMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      message
    );

    // We need to collect the full response to save it
    const [streamForClient, streamForSave] = stream.tee();

    // Save assistant response in background
    const saveResponse = async () => {
      const reader = streamForSave.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullContent += decoder.decode(value, { stream: true });
      }

      if (fullContent) {
        await supabase.from("chat_messages").insert({
          notebook_id: notebookId,
          user_id: user.id,
          role: "assistant" as const,
          content: fullContent,
          model: "gemini-3-flash-preview",
        });
      }
    };

    saveResponse().catch(console.error);

    return new Response(streamForClient, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
