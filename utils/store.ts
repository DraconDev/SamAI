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
  
  // Keep only the last 50 messages
  if (messages.length > 200) {
    messages.splice(0, messages.length - 200);
  }
  
  await chatStore.setValue({ messages });
  return messages;
}

export interface SearchSettingsStore {
    searchActive: boolean;
}

export const defaultSearchSettingsStore: SearchSettingsStore = {
    searchActive: true,
};

export const searchSettingsStore = storage.defineItem<SearchSettingsStore>('sync:searchSettings', {
    fallback: defaultSearchSettingsStore,
});

export interface ApiKeyStore {
    apiKey: string;
}

export const defaultApiKeyStore: ApiKeyStore = {
    apiKey: "",
};

export const apiKeyStore = storage.defineItem<ApiKeyStore>('sync:apiKey', {
    fallback: defaultApiKeyStore,
});
