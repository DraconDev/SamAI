export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatStore {
  messages: ChatMessage[];
}

export const defaultChatStore: ChatStore = {
  messages: [],
};

// Use local storage for chat messages and limit to 50 messages
export const chatStore = storage.defineItem<ChatStore>("local:chat", {
  fallback: defaultChatStore,
});

// Helper function to clean up old messages
export async function addChatMessage(message: ChatMessage) {
  const store = await chatStore.getValue();
  const messages = [...store.messages, message];

  // Keep only the last 200 messages
  if (messages.length > 200) {
    messages.splice(0, messages.length - 200);
  }

  await chatStore.setValue({ messages });
  return messages;
}

export type PromptStyle = "short" | "medium" | "long";

import { type OutputFormat } from "./page-content"; // Import OutputFormat

export interface SearchSettingsStore {
  searchActive: boolean;
  promptStyle: PromptStyle;
  continuePreviousChat?: boolean;
  outputFormat: OutputFormat;
  showFloatingIcon: boolean;
  autoHighlight: boolean;
  highlightOpacity: number;
  enableHighlighting: boolean;
}

export const defaultSearchSettingsStore: SearchSettingsStore = {
  searchActive: true,
  promptStyle: "short",
  continuePreviousChat: false,
  outputFormat: "text",
  showFloatingIcon: true, // Default to true
  autoHighlight: true,
  highlightOpacity: 0.3,
  enableHighlighting: true,
};

export const PROMPT_TEMPLATES = {
  short:
    "Provide a concise but informative search result that offers unique insights or perspectives on this topic.",
  medium:
    "Analyze this search query and provide a comprehensive response that includes key facts, important context, and notable viewpoints. Focus on delivering balanced information that helps understand the topic better.",
  long: "Provide an in-depth analysis of this search query covering multiple aspects: key facts, historical context, current developments, different perspectives, and potential implications. Include relevant examples and expert insights where applicable. Aim to give a thorough understanding while maintaining clarity and structure.",
};

export const searchSettingsStore = storage.defineItem<SearchSettingsStore>(
  "sync:searchSettings",
  {
    fallback: defaultSearchSettingsStore,
  }
);

export type AiProvider = "google" | "openai" | "anthropic" | "openrouter";

export interface ApiKeyStore {
  googleApiKey: string;
  googleModel: string;
  openaiApiKey: string;
  openaiModel: string;
  anthropicApiKey: string;
  anthropicModel: string;
  openrouterApiKey: string;
  openrouterModel: string;
  selectedProvider: AiProvider;
}

export const defaultApiKeyStore: ApiKeyStore = {
  googleApiKey: "",
  googleModel: "gemini-flash-lite-latest",
  openaiApiKey: "",
  openaiModel: "gpt-4o-mini",
  anthropicApiKey: "",
  anthropicModel: "claude-3-haiku-20240307",
  openrouterApiKey: "",
  openrouterModel: "openai/gpt-oss-20b", // User requested default
  selectedProvider: "google",
};

export const apiKeyStore = storage.defineItem<ApiKeyStore>("sync:apiKey", {
  fallback: defaultApiKeyStore,
  migrations: {
    // Migrate old string-based api key to googleApiKey
    1: (oldValue: any) => {
      if (typeof oldValue === "string") {
        return {
          ...defaultApiKeyStore,
          googleApiKey: oldValue,
        };
      }
      // If it was an object but with old structure (though strictly typed before, storage might be raw)
      if (typeof oldValue === "object" && oldValue !== null && "apiKey" in oldValue) {
         return {
          ...defaultApiKeyStore,
          googleApiKey: oldValue.apiKey,
        };
      }
      return defaultApiKeyStore;
    },
  },
});

export interface LastUsedTexts {
  inputTexts: string[];
  pageAssistantTexts: string[];
}

export interface LastUsedTextsStore {
  texts: LastUsedTexts;
}

export const defaultLastUsedTextsStore: LastUsedTextsStore = {
  texts: {
    inputTexts: [],
    pageAssistantTexts: [],
  },
};

export const lastUsedTextsStore = storage.defineItem<LastUsedTextsStore>(
  "sync:lastUsedTexts",
  {
    fallback: defaultLastUsedTextsStore,
  }
);

export async function addInputText(text: string) {
  const store = await lastUsedTextsStore.getValue();
  const inputTexts = [text, ...store.texts.inputTexts].slice(0, 5);
  await lastUsedTextsStore.setValue({
    texts: { ...store.texts, inputTexts },
  });
  return inputTexts;
}

export async function addPageAssistantText(text: string) {
  const store = await lastUsedTextsStore.getValue();
  const pageAssistantTexts = [text, ...store.texts.pageAssistantTexts].slice(
    0,
    5
  );
  await lastUsedTextsStore.setValue({
    texts: { ...store.texts, pageAssistantTexts },
  });
  return pageAssistantTexts;

}


export interface PageContextStore {
  content: string;
  url: string;
  title: string;
  timestamp: string;
  format: OutputFormat;
}

export const defaultPageContextStore: PageContextStore = {
  content: "",
  url: "",
  title: "",
  timestamp: "",
  format: "text",
};

export const pageContextStore = storage.defineItem<PageContextStore>("local:pageContext", {
  fallback: defaultPageContextStore,
});

export interface HighlightPattern {
  id: string;
  pattern: string;
  color: string;
  description: string;
  enabled: boolean;
  category: "default" | "important" | "favorite";
}

export interface HighlightPatternsStore {
  patterns: HighlightPattern[];
}

export const defaultHighlightPatternsStore: HighlightPatternsStore = {
  patterns: [],
};

export const highlightPatternsStore = storage.defineItem<HighlightPatternsStore>(
  "sync:highlightPatterns",
  {
    fallback: defaultHighlightPatternsStore,
  }
);

