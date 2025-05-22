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

export type OutputFormat = "text" | "html";

export interface SearchSettingsStore {
  searchActive: boolean;
  promptStyle: PromptStyle;
  continuePreviousChat: boolean;
  outputFormat: OutputFormat; // Add outputFormat
}

export const defaultSearchSettingsStore: SearchSettingsStore = {
  searchActive: true,
  promptStyle: "short",
  continuePreviousChat: false,
  outputFormat: "text", // Default to text
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

export interface ApiKeyStore {
  apiKey: string;
}

export const defaultApiKeyStore: ApiKeyStore = {
  apiKey: "",
};

export const apiKeyStore = storage.defineItem<ApiKeyStore>("sync:apiKey", {
  fallback: defaultApiKeyStore,
});
