import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const ASPECT_RATIOS: Record<string, string> = {
  landscape: "16:9",
  portrait: "9:16",
  square: "1:1",
};

export async function generateInfographicImage(params: {
  sourceContent: string;
  language: string;
  orientation: string;
  detailLevel: string;
  userPrompt: string;
}): Promise<{ imageData: string; mimeType: string }> {
  const { sourceContent, language, orientation, detailLevel, userPrompt } =
    params;

  const languageNames: Record<string, string> = {
    ko: "Korean",
    en: "English",
    ja: "Japanese",
    zh: "Chinese",
    es: "Spanish",
    fr: "French",
    de: "German",
  };

  const detailLabels: Record<string, string> = {
    concise: "concise with key highlights only",
    standard: "standard level of detail",
    detailed: "comprehensive with in-depth data points",
  };

  const prompt = `Create a professional infographic in ${languageNames[language] || "Korean"}.

Topic and key data points from sources:
${sourceContent.slice(0, 8000)}

Detail level: ${detailLabels[detailLevel] || "standard level of detail"}

Requirements:
- All text must be in ${languageNames[language] || "Korean"}
- Use clean, modern design with clear visual hierarchy
- Include relevant icons, charts, and data visualizations
- Ensure all text is legible and properly rendered
- Professional color scheme with good contrast

${userPrompt ? `Additional style instructions: ${userPrompt}` : ""}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseModalities: ["IMAGE"],
      imageGenerationConfig: {
        aspectRatio: ASPECT_RATIOS[orientation] || "16:9",
      },
    } as Record<string, unknown>,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData);

  if (!imagePart?.inlineData) {
    throw new Error("이미지 생성에 실패했습니다.");
  }

  return {
    imageData: imagePart.inlineData.data as string,
    mimeType: imagePart.inlineData.mimeType as string,
  };
}

export async function generateSlideImage(params: {
  slideNumber: number;
  totalSlides: number;
  topic: string;
  slideTitle: string;
  slideContent: string;
  language: string;
  format: string;
  userPrompt: string;
}): Promise<{ imageData: string; mimeType: string }> {
  const {
    slideNumber,
    totalSlides,
    topic,
    slideTitle,
    slideContent,
    language,
    format,
    userPrompt,
  } = params;

  const languageNames: Record<string, string> = {
    ko: "Korean",
    en: "English",
    ja: "Japanese",
    zh: "Chinese",
    es: "Spanish",
    fr: "French",
    de: "German",
  };

  const formatStyle =
    format === "presenter"
      ? "visual-focused with minimal text, large key words"
      : "text-rich with detailed explanations";

  const prompt = `Create slide ${slideNumber} of ${totalSlides} for a ${formatStyle} presentation.
Language: ${languageNames[language] || "Korean"}
Overall topic: ${topic}

This slide:
- Title: ${slideTitle}
- Key points: ${slideContent}

Style: Professional presentation slide, 16:9 aspect ratio.
Requirements:
- All text in ${languageNames[language] || "Korean"}
- Consistent visual style suitable for a professional presentation
- Clear, readable typography with good hierarchy
- Modern design with appropriate use of color

${userPrompt ? `Additional instructions: ${userPrompt}` : ""}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseModalities: ["IMAGE"],
      imageGenerationConfig: {
        aspectRatio: "16:9",
      },
    } as Record<string, unknown>,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData);

  if (!imagePart?.inlineData) {
    throw new Error(`슬라이드 ${slideNumber} 이미지 생성에 실패했습니다.`);
  }

  return {
    imageData: imagePart.inlineData.data as string,
    mimeType: imagePart.inlineData.mimeType as string,
  };
}
