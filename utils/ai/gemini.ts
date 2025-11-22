import { apiKeyStore } from "@/utils/store";
import { GoogleGenerativeAI } from "@google/generative-ai";

export let genAI: GoogleGenerativeAI;
export let model: any;

export function initializeModel(apiKey: string) {
  try {
    console.log("[SamAI Gemini] Initializing GoogleGenerativeAI");
    genAI = new GoogleGenerativeAI(apiKey);

    console.log("[SamAI Gemini] Creating model instance");
    model = genAI.getGenerativeModel({
      model: "gemini-flash-list-latest",
    });
    console.log("[SamAI Gemini] Model initialized successfully");
  } catch (error: any) {
    console.error("[SamAI Gemini] Error initializing model:", {
      message: error.message,
      stack: error.stack,
      errorType: error.constructor.name,
    });
    throw error;
  }
}

export async function generateFormResponse(
  prompt: string
): Promise<string | null> {
  try {
    console.log("[SamAI Gemini] Generating response for prompt:", prompt);

    const store = await apiKeyStore.getValue();
    console.log("[SamAI Gemini] Retrieved store:", {
      hasApiKey: !!store.apiKey,
    });

    if (!store.apiKey) {
      console.warn("[SamAI Gemini] No API key found in store. Returning null."); // Added more specific log
      return null;
    }

    if (!model) {
      console.log(
        "[SamAI Gemini] Model not initialized, initializing with API key"
      );
      initializeModel(store.apiKey);
    } else {
      console.log("[SamAI Gemini] Using existing model instance");
    }

    console.log("[SamAI Gemini] Sending request to Gemini API");
    const result = await model.generateContent(prompt);
    console.log("[SamAI Gemini] Raw API response:", result); // Log full result directly

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
      console.error(
        "[SamAI Gemini] Invalid response structure:",
        result.response
      ); // Log full response directly
      throw new Error("No candidates in response from Gemini API");
    }

    const response = result.response.candidates[0].content.parts[0].text;
    console.log("[SamAI Gemini] Successfully generated response");
    return response.trim();
  } catch (error: unknown) {
    // Explicitly type error as unknown
    const err = error as Error; // Cast to Error for property access
    console.error("[SamAI Gemini] Error generating Gemini response:", {
      timestamp: new Date().toISOString(),
      message: err.message,
      stack: err.stack,
      errorType: err.constructor.name,
    });
    return null;
  }
}
