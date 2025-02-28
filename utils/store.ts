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

export const chatStore = storage.defineItem<ChatStore>("sync:chat", {
  fallback: defaultChatStore,
});

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
