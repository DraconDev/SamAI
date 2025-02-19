import { GoogleGenerativeAI } from "@google/generative-ai";
import { apiKeyStore } from "@/utils/store";

export let genAI: GoogleGenerativeAI;
export let model: any;

export function initializeModel(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: "gemini-flas",
  });
}

export interface GeminiResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export async function generateFormResponse(
  prompt: string
): Promise<GeminiResponse> {
  try {
    const apiKey = await apiKeyStore.getValue().then((store) => {
      return store.apiKey;
    });
    if (!apiKey) {
      return {
        success: false,
        error: "API key not found"
      };
    }
    if (!model) {
      initializeModel(apiKey);
    }

    const result = await model.generateContent(prompt);

    // Validate API response structure
    if (!result || !result.response) {
      throw new Error("Empty response from Gemini API");
    }
    if (
      !result.response.candidates ||
      !result.response.candidates[0] ||
      !result.response.candidates[0].content ||
      !result.response.candidates[0].content.parts ||
      !result.response.candidates[0].content.parts[0] ||
      !result.response.candidates[0].content.parts[0].text
    ) {
      throw new Error("No candidates in response from Gemini API");
    }

    const text = result.response.candidates[0].content.parts[0].text.trim();
    return {
      success: true,
      text: text
    };
  } catch (error: any) {
    console.error("Error generating Gemini response:", {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack
    });
    return {
      success: false,
      error: error.message || "Unknown error"
    };
  }
}
