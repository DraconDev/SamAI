// Chrome AI API type definitions
declare global {
  interface Window {
    ai?: {
      languageModel?: {
        create: (options?: {
          systemPrompt?: string;
          temperature?: number;
          topK?: number;
          topP?: number;
        }) => Promise<AIConversation>;
      };
    };
  }

  interface AIConversation {
    prompt: (prompt: string) => Promise<string>;
    promptStreaming: (prompt: string) => AsyncIterableIterator<string>;
    countPromptTokens: (prompt: string) => Promise<number>;
    close: () => void;
  }
}

export {};
