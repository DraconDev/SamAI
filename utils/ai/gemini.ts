import { apiKeyStore } from "@/utils/store";
import { GoogleGenerativeAI } from "@google/generative-ai";

export let genAI: GoogleGenerativeAI;
export let model: any;

export function initializeGeminiModel(apiKey: string) {
  try {
    console.log("[SamAI] Initializing GoogleGenerativeAI");
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
    });
    console.log("[SamAI] Gemini model initialized successfully");
  } catch (error: any) {
    console.error("[SamAI] Error initializing Gemini model:", error);
    throw error;
  }
}

async function generateGeminiResponse(apiKey: string, prompt: string): Promise<string | null> {
  if (!model) {
    initializeGeminiModel(apiKey);
  }
  try {
    const result = await model.generateContent(prompt);
    if (!result || !result.response) throw new Error("Empty response from Gemini API");
    return result.response.text();
  } catch (error) {
    console.error("[SamAI] Gemini API Error:", error);
    return null;
  }
}

async function generateOpenAIResponse(apiKey: string, prompt: string): Promise<string | null> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "OpenAI API Error");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("[SamAI] OpenAI API Error:", error);
    return null;
  }
}

async function generateAnthropicResponse(apiKey: string, prompt: string): Promise<string | null> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "dangerously-allow-browser": "true", // Required for browser extensions
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Anthropic API Error");
    }

    const data = await response.json();
    return data.content[0]?.text || null;
  } catch (error) {
    console.error("[SamAI] Anthropic API Error:", error);
    return null;
  }
}

async function generateOpenRouterResponse(apiKey: string, model: string, prompt: string): Promise<string | null> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://github.com/google/wxt", // Optional, for including your app on openrouter.ai rankings.
        "X-Title": "SamAI", // Optional. Shows in rankings on openrouter.ai.
      },
      body: JSON.stringify({
        model: model || "google/gemini-flash-1.5",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "OpenRouter API Error");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("[SamAI] OpenRouter API Error:", error);
    return null;
  }
}

export async function generateFormResponse(prompt: string): Promise<string | null> {
  try {
    const store = await apiKeyStore.getValue();
    const provider = store.selectedProvider || "google";
    const apiKey = store[`${provider}ApiKey` as keyof typeof store] as string;

    if (!apiKey) {
      console.warn(`[SamAI] No API key found for provider: ${provider}`);
      return null;
    }

    console.log(`[SamAI] Generating response using provider: ${provider}`);

    switch (provider) {
      case "google":
        return await generateGeminiResponse(apiKey, prompt);
      case "openai":
        return await generateOpenAIResponse(apiKey, prompt);
      case "anthropic":
        return await generateAnthropicResponse(apiKey, prompt);
      case "openrouter":
        return await generateOpenRouterResponse(apiKey, store.openrouterModel, prompt);
      default:
        console.error("[SamAI] Unknown provider:", provider);
        return null;
    }
  } catch (error) {
    console.error("[SamAI] Error generating response:", error);
    return null;
  }
}
