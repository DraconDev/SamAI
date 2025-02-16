import { GoogleGenerativeAI } from "@google/generative-ai";

export let genAI: GoogleGenerativeAI;
export let model: any;

export function initializeModel(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
}

export async function generateFormResponse(
  apiKey?: string
): Promise<string | null> {
  try {
    const apiKey = await storage.getItem("apiKey")
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

    const response = result.response.candidates[0].content.parts[0].text;
    return response.trim();
  } catch (error: any) {
    console.error("Error analyzing HTML element:", {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      errorType: error.constructor.name,
    });
    return null;
  }
}
