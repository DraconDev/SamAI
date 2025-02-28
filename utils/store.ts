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

export type PromptStyle = 'short' | 'medium' | 'long';

export interface AppSettingsStore {
    searchActive: boolean;
    promptStyle: PromptStyle;
    persistChat: boolean;
}

export const defaultAppSettingsStore: AppSettingsStore = {
    searchActive: true,
    promptStyle: 'short',
    persistChat: true
};

export const appSettingsStore = storage.defineItem<AppSettingsStore>("sync:settings", {
    fallback: defaultAppSettingsStore,
});

// Deprecated, use appSettingsStore instead

export const PROMPT_TEMPLATES = {
    short: 'Provide a concise but informative search result that offers unique insights or perspectives on this topic.',
    medium: 'Analyze this search query and provide a comprehensive response that includes key facts, important context, and notable viewpoints. Focus on delivering balanced information that helps understand the topic better.',
    long: 'Provide an in-depth analysis of this search query covering multiple aspects: key facts, historical context, current developments, different perspectives, and potential implications. Include relevant examples and expert insights where applicable. Aim to give a thorough understanding while maintaining clarity and structure.'
};

// Keep for backward compatibility, but forward to appSettingsStore
export const searchSettingsStore = {
  getValue: async () => {
    const settings = await appSettingsStore.getValue();
    return {
      searchActive: settings.searchActive,
      promptStyle: settings.promptStyle
    };
  },
  setValue: async (value: Pick<AppSettingsStore, 'searchActive' | 'promptStyle'>) => {
    const currentSettings = await appSettingsStore.getValue();
    await appSettingsStore.setValue({
      ...currentSettings,
      ...value
    });
  }
};

export interface ApiKeyStore {
  apiKey: string;
}

export const defaultApiKeyStore: ApiKeyStore = {
  apiKey: "",
};

export const apiKeyStore = storage.defineItem<ApiKeyStore>("sync:apiKey", {
  fallback: defaultApiKeyStore,
});
