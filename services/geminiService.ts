import { GoogleGenAI } from "@google/genai";
import { MeetingType, MeetingLanguage, ImageSize } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMeetingNotes = async (
  audioBase64: string,
  mimeType: string,
  type: MeetingType,
  lang: MeetingLanguage
): Promise<string> => {
  const ai = getClient();
  
  let languageInstruction = "The meeting may be in English, Kiswahili, or both.";
  if (lang === MeetingLanguage.KISWAHILI) languageInstruction = "The audio is in Kiswahili. Provide the response mostly in Kiswahili.";
  if (lang === MeetingLanguage.ENGLISH) languageInstruction = "The audio is in English. Provide the response in English.";

  const prompt = `
    You are an expert meeting secretary. ${languageInstruction}
    Context: This is a ${type} meeting recording.
    
    Task: Analyze the audio and generate professional notes in Markdown.
    Structure exactly as follows:

    ## 📋 Executive Summary
    (A brief paragraph summary of the meeting's purpose and outcome)

    ## 💡 Key Decisions
    (Bulleted list of decisions made)

    ## ✅ Action Items
    (Create a Markdown Table with columns: Task, Owner, Deadline)

    ## ⏭️ Next Steps
    (Bulleted list of upcoming events or requirements)
  `;

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
    }
  });

  return response.text || "No notes generated.";
};

export const generateImage = async (
  prompt: string,
  size: ImageSize
): Promise<string | null> => {
  // Always create a new client to ensure we pick up the latest API key from the environment
  // which might have been updated by window.aistudio.openSelectKey()
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: "1:1" // Defaulting to square, could be parameterized if needed
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
