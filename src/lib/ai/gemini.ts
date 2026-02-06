import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateChatResponse(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  userMessage: string
): Promise<ReadableStream<Uint8Array>> {
  const formattedHistory = messages.map((msg) => ({
    role: msg.role === "user" ? ("user" as const) : ("model" as const),
    parts: [{ text: msg.content }],
  }));

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemPrompt,
    },
    history: formattedHistory,
  });

  const response = await chat.sendMessageStream({ message: userMessage });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export async function generateText(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return response.text || "";
}

export async function generateSummary(text: string): Promise<string> {
  const truncated = text.slice(0, 50000);
  return generateText(
    `다음 텍스트의 핵심 내용을 3-5문장으로 간결하게 요약해주세요:\n\n${truncated}`
  );
}
