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
