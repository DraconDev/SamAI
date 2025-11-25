import { generateFormResponse } from "./gemini";
import { apiKeyStore } from "../store";

export interface FormFillRequest {
  pageHtml: string;
  userInstructions: string;
  includeContext?: boolean;
}

/**
 * AI service for generating form field values based on page context and user instructions
 */
export async function generateFormFieldValues({
  pageHtml,
  userInstructions,
  includeContext = true
}: FormFillRequest): Promise<string | null> {
  try {
    // Check if API key is available
    const apiKeyData = await apiKeyStore.getValue();
    const provider = apiKeyData.selectedProvider || "google";
    const key = apiKeyData[`${provider}ApiKey` as keyof typeof apiKeyData];
    
    if (!key) {
      throw new Error("API key not configured. Please set up your API key first.");
    }

    // Build the prompt for the AI
    const prompt = buildFormFillPrompt(pageHtml, userInstructions, includeContext);
    
    console.log("[SamAI] Generating form field values with prompt:", prompt);
    
    // Get AI response
    const response = await generateFormResponse(prompt);
    
    if (!response) {
      throw new Error("No response received from AI service");
    }
    
    console.log("[SamAI] AI response for form filling:", response);
    return response;
    
  } catch (error) {
    console.error("[SamAI] Error generating form field values:", error);
    throw error;
  }
}

/**
 * Builds the prompt for AI form filling
 */
function buildFormFillPrompt(
  pageHtml: string, 
  userInstructions: string, 
  includeContext: boolean
): string {
  const systemPrompt = `You are SamAI, an expert form-filling assistant. Your task is to analyze form fields on a webpage and provide appropriate values based on the user's instructions.

Instructions:
1. Analyze the form fields provided in the HTML
2. Consider the user's specific instructions
3. Generate appropriate values for each field based on context and instructions
4. Return your response as a JSON object where keys are field names/IDs and values are the suggested data
5. Use realistic, appropriate values that match the field types and context
6. For text fields, provide meaningful content
7. For checkboxes/radio buttons, use true/false
8. For select dropdowns, choose the most appropriate option
9. Keep responses concise but informative

User Instructions: ${userInstructions}

Form Fields HTML:
${pageHtml}

Please provide your response in the following JSON format:
\`\`\`json
{
  "fieldName1": "appropriate value 1",
  "fieldName2": "appropriate value 2",
  "fieldName3": "true"
}
\`\`\`

Only return the JSON object, no additional text or explanations.`;

  return systemPrompt;
}