import { GoogleGenerativeAI } from "@google/generative-ai";
import { apiKeyStore } from "@/utils/store";

export let genAI: GoogleGenerativeAI;
export let model: any;

export function initializeModel(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
}

export async function generateFormResponse(
  prompt: string
): Promise<string | null> {
  try {
    console.log("[SamAI Gemini] Generating response for prompt:", prompt);
    
    const apiKey = await apiKeyStore.getValue().then((store) => {
      return store.apiKey;
    });
    if (!apiKey) {
      console.warn("[SamAI Gemini] No API key found");
      return null;
    }
    
    if (!model) {
      console.log("[SamAI Gemini] Initializing model with API key");
      initializeModel(apiKey);
    }

    console.log("[SamAI Gemini] Sending request to Gemini API");
    const result = await model.generateContent(prompt);
    console.log("[SamAI Gemini] Raw API response:", result);

    // Validate API response structure
    if (!result || !result.response) {
      console.error("[SamAI Gemini] Empty response from API:", result);
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
      console.error("[SamAI Gemini] Invalid response structure:", result.response);
      throw new Error("No candidates in response from Gemini API");
    }

    const response = result.response.candidates[0].content.parts[0].text;
    console.log("[SamAI Gemini] Successfully generated response");
    return response.trim();
  } catch (error: any) {
    console.error("Error generating Gemini response:", {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      errorType: error.constructor.name,
    });
    return null;
  }
}
