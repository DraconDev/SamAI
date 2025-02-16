export interface ApiKeyStore {
    apiKey: string;
}

export const defaultApiKeyStore: ApiKeyStore = {
    apiKey: "",
};

export const apiKeyStore = storage.defineItem<ApiKeyStore>('sync:apiKey', {
    fallback: defaultApiKeyStore,
});
