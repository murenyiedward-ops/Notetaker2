import { GoogleGenAI } from "@google/genai";
import { MeetingType, MeetingLanguage, ImageAspectRatio } from "../types.ts";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMeetingNotes = async (
  audioBase64: string,
  mimeType: string,
  type: MeetingType,
  lang: MeetingLanguage
): Promise<string> => {
  const ai = getClient();
  
  let languageInstruction = "Auto-detect language (Kiswahili/English).";
  if (lang === MeetingLanguage.KISWAHILI) languageInstruction = "The audio is strictly Kiswahili.";
  if (lang === MeetingLanguage.ENGLISH) languageInstruction = "The audio is strictly English.";

  const prompt = `Analyze this ${type} meeting audio. Language: ${languageInstruction}
    Provide a professional summary with:
    1. Executive Summary
    2. Key Decisions
    3. Action Items (Markdown Table)
    4. Next Steps
    Use Markdown formatting.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType,
            data: audioBase64
          }
        }
      ]
    },
    config: {
      // Disable thinking for fastest response time
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  return response.text || "No notes generated.";
};

export const generateImage = async (
  prompt: string,
  aspectRatio: ImageAspectRatio
): Promise<string | null> => {
  const ai = getClient();

  // Using gemini-2.5-flash-image as it uses the standard API key and doesn't require paid key selection logic
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  return null;
};