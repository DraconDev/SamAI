import { apiKeyStore } from "@/utils/store";
import { GoogleGenerativeAI, type GenerateContentResponse } from "@google/generative-ai";

// Type definitions for better type safety
export interface GeminiResponse {
  text: string;
  success: boolean;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  retryable: boolean;
}

export let genAI: GoogleGenerativeAI | null = null;
export let model: any = null;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Enhanced error classification for better handling
 */
function classifyApiError(error: any): ApiError {
  const message = error?.message || "Unknown error occurred";
  
  // Check for retryable errors
  const retryablePatterns = [
    "rate limit",
    "quota exceeded",
    "network error",
    "timeout",
    "503",
    "502",
    "429"
  ];
  
  const isRetryable = retryablePatterns.some(pattern => 
    message.toLowerCase().includes(pattern)
  );
  
  return {
    message,
    code: error?.code,
    retryable: isRetryable
  };
}

/**
 * Retry mechanism with exponential backoff
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const classifiedError = classifyApiError(error);
      
      console.error(`[SamAI Gemini] Attempt ${attempt + 1} failed:`, {
        error: classifiedError,
        attempt: attempt + 1,
        maxRetries
      });
      
      // Don't retry on the last attempt or if error is not retryable
      if (attempt === maxRetries || !classifiedError.retryable) {
        break;
      }
      
      // Exponential backoff with jitter
      const delay = RETRY_DELAY * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Initialize the Gemini model with enhanced error handling
 */
export function initializeModel(apiKey: string): void {
  try {
    console.log("[SamAI Gemini] Initializing GoogleGenerativeAI");
    
    if (!apiKey || typeof apiKey !== "string") {
      throw new Error("Valid API key is required");
    }
    
    genAI = new GoogleGenerativeAI(apiKey);
    
    console.log("[SamAI Gemini] Creating model instance");
    // Using the latest stable Flash Lite model for optimal performance
    model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-8b",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    console.log("[SamAI Gemini] Model initialized successfully");
  } catch (error: any) {
    console.error("[SamAI Gemini] Error initializing model:", {
      message: error.message,
      stack: error.stack,
      errorType: error.constructor.name,
    });
    throw new Error(`Failed to initialize Gemini model: ${error.message}`);
  }
}

/**
 * Validate and parse Gemini API response
 */
function parseGeminiResponse(result: GenerateContentResponse): string {
  if (!result || !result.response) {
    throw new Error("Empty response from Gemini API");
  }

  const response = result.response;
  
  if (!response.candidates || response.candidates.length === 0) {
    throw new Error("No candidates in response from Gemini API");
  }
  
  const candidate = response.candidates[0];
  
  if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
    throw new Error("Invalid response structure: missing content parts");
  }
  
  const text = candidate.content.parts[0].text;
  
  if (!text || typeof text !== "string") {
    throw new Error("Invalid response: text content is missing or invalid");
  }
  
  return text.trim();
}

/**
 * Generate form response with comprehensive error handling and retry logic
 */
export async function generateFormResponse(prompt: string): Promise<GeminiResponse> {
  try {
    console.log("[SamAI Gemini] Generating response for prompt:", {
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 100) + (prompt.length > 100 ? "..." : "")
    });

    // Validate input
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return {
        text: "",
        success: false,
        error: "Prompt cannot be empty"
      };
    }

    // Get API key from store
    const store = await apiKeyStore.getValue();
    
    if (!store?.apiKey) {
      console.warn("[SamAI Gemini] No API key found in store");
      return {
        text: "",
        success: false,
        error: "API key not configured. Please set your Google AI API key."
      };
    }

    // Initialize model if needed
    if (!model || !genAI) {
      console.log("[SamAI Gemini] Model not initialized, initializing with API key");
      initializeModel(store.apiKey);
    }

    // Generate response with retry logic
    const result = await withRetry(async () => {
      console.log("[SamAI Gemini] Sending request to Gemini API");
      return await model.generateContent(prompt);
    });

    // Parse and validate response
    const responseText = parseGeminiResponse(result);
    
    console.log("[SamAI Gemini] Successfully generated response", {
      responseLength: responseText.length
    });

    return {
      text: responseText,
      success: true
    };

  } catch (error: any) {
    const classifiedError = classifyApiError(error);
    const errorMessage = classifiedError.message;
    
    console.error("[SamAI Gemini] Error generating response:", {
      timestamp: new Date().toISOString(),
      message: errorMessage,
      stack: error?.stack,
      errorType: error?.constructor?.name,
      isRetryable: classifiedError.retryable
    });

    return {
      text: "",
      success: false,
      error: `Failed to generate AI response: ${errorMessage}`
    };
  }
}

/**
 * Health check function to verify model connectivity
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await generateFormResponse("Hello, are you working?");
    return response.success;
  } catch (error) {
    console.error("[SamAI Gemini] Health check failed:", error);
    return false;
  }
}

/**
 * Clear model instance (useful for cleanup or API key changes)
 */
export function clearModel(): void {
  genAI = null;
  model = null;
  console.log("[SamAI Gemini] Model instance cleared");
}
