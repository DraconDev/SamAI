import { apiKeyStore, type AiProvider } from "@/utils/store";
import { useEffect, useState } from "react";

function App() {
  const [googleKey, setGoogleKey] = useState("");
  const [googleModel, setGoogleModel] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [anthropicModel, setAnthropicModel] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [openrouterModel, setOpenrouterModel] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>("google");
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing API keys on mount
    apiKeyStore.getValue().then((store) => {
      setGoogleKey(store.googleApiKey || "");
      setGoogleModel(store.googleModel || "gemini-flash-lite-latest");
      setOpenaiKey(store.openaiApiKey || "");
      setOpenaiModel(store.openaiModel || "gpt-4o-mini");
      setAnthropicKey(store.anthropicApiKey || "");
      setAnthropicModel(store.anthropicModel || "claude-3-haiku-20240307");
      setOpenrouterKey(store.openrouterApiKey || "");
      setOpenrouterModel(store.openrouterModel || "openai/gpt-oss-20b");
      setSelectedProvider(store.selectedProvider || "google");
    });
  }, []);

  const handleSave = async () => {
    await apiKeyStore.setValue({
      googleApiKey: googleKey,
      googleModel: googleModel,
      openaiApiKey: openaiKey,
      openaiModel: openaiModel,
      anthropicApiKey: anthropicKey,
      anthropicModel: anthropicModel,
      openrouterApiKey: openrouterKey,
      openrouterModel: openrouterModel,
      selectedProvider: selectedProvider,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleShowKey = (provider: string) => {
    setShowKey((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const renderKeyInput = (
    label: string,
    value: string,
    setValue: (val: string) => void,
    providerId: string,
    placeholder: string,
    link: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={providerId}
          className="block text-sm font-medium text-gray-300"
        >
          {label}
        </label>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="group text-sm font-medium text-[#818cf8] flex items-center gap-1 hover:text-[#4f46e5] transition-colors"
        >
          Get Key
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>
      <div className="relative">
        <input
          type={showKey[providerId] ? "text" : "password"}
          id={providerId}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-3 py-2.5 bg-[#1a1b2e] border border-[#2E2F3E] rounded-lg shadow-sm 
                   text-gray-100 placeholder-gray-500
                   focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5]
                   transition-all duration-200"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => toggleShowKey(providerId)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-200 
                   rounded-md hover:bg-[#2E2F3E] transition-all duration-200"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {showKey[providerId] ? (
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22" />
            ) : (
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 0 1 0 6 3 3 0 0 1 0-6z" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );

  const renderModelInput = (
    label: string,
    value: string,
    setValue: (val: string) => void,
    id: string,
    placeholder: string,
    helpText: string
  ) => (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-300"
      >
        {label}
      </label>
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-3 py-2.5 bg-[#1a1b2e] border border-[#2E2F3E] rounded-lg shadow-sm 
                 text-gray-100 placeholder-gray-500
                 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5]
                 transition-all duration-200"
        placeholder={placeholder}
      />
      <p className="text-xs text-gray-500">{helpText}</p>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16]">
      <div className="relative p-8 w-[450px] bg-[#1E1F2E] rounded-lg shadow-2xl border border-[#2E2F3E] max-h-[90vh] overflow-y-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text">
            AI Provider Settings
          </h1>
          <div className="h-0.5 w-16 mx-auto mt-3 bg-gradient-to-r from-[#4f46e5] to-[#818cf8]"></div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Select Active Provider
            </label>
            <div className="grid grid-cols-4 gap-2 p-1 bg-[#1a1b2e] rounded-lg border border-[#2E2F3E]">
              {(["google", "openai", "anthropic", "openrouter"] as const).map((provider) => (
                <button
                  key={provider}
                  onClick={() => setSelectedProvider(provider)}
                  className={`px-2 py-2 text-xs font-medium rounded-md transition-all duration-200 capitalize truncate
                    ${
                      selectedProvider === provider
                        ? "bg-[#4f46e5] text-white shadow-lg"
                        : "text-gray-400 hover:text-gray-200 hover:bg-[#2E2F3E]"
                    }`}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 border-t border-[#2E2F3E] pt-6">
            {/* Google Section */}
            <div className={selectedProvider === "google" ? "block" : "hidden"}>
              <div className="space-y-4">
                {renderKeyInput(
                  "Google Gemini API Key",
                  googleKey,
                  setGoogleKey,
                  "google",
                  "AIzaSy...",
                  "https://aistudio.google.com/apikey"
                )}
                {renderModelInput(
                  "Gemini Model",
                  googleModel,
                  setGoogleModel,
                  "googleModel",
                  "gemini-flash-lite-latest",
                  "e.g., gemini-1.5-pro, gemini-1.5-flash"
                )}
              </div>
            </div>

            {/* OpenAI Section */}
            <div className={selectedProvider === "openai" ? "block" : "hidden"}>
              <div className="space-y-4">
                {renderKeyInput(
                  "OpenAI API Key",
                  openaiKey,
                  setOpenaiKey,
                  "openai",
                  "sk-...",
                  "https://platform.openai.com/api-keys"
                )}
                {renderModelInput(
                  "OpenAI Model",
                  openaiModel,
                  setOpenaiModel,
                  "openaiModel",
                  "gpt-4o-mini",
                  "e.g., gpt-4o, gpt-3.5-turbo"
                )}
              </div>
            </div>

            {/* Anthropic Section */}
            <div className={selectedProvider === "anthropic" ? "block" : "hidden"}>
              <div className="space-y-4">
                {renderKeyInput(
                  "Anthropic API Key",
                  anthropicKey,
                  setAnthropicKey,
                  "anthropic",
                  "sk-ant-...",
                  "https://console.anthropic.com/settings/keys"
                )}
                {renderModelInput(
                  "Anthropic Model",
                  anthropicModel,
                  setAnthropicModel,
                  "anthropicModel",
                  "claude-3-haiku-20240307",
                  "e.g., claude-3-opus-20240229"
                )}
              </div>
            </div>

            {/* OpenRouter Section */}
            <div className={selectedProvider === "openrouter" ? "block" : "hidden"}>
              <div className="space-y-4">
                {renderKeyInput(
                  "OpenRouter API Key",
                  openrouterKey,
                  setOpenrouterKey,
                  "openrouter",
                  "sk-or-...",
                  "https://openrouter.ai/keys"
                )}
                {renderModelInput(
                  "OpenRouter Model",
                  openrouterModel,
                  setOpenrouterModel,
                  "openrouterModel",
                  "openai/gpt-oss-20b",
                  "Enter model ID from OpenRouter"
                )}
                <div className="text-right">
                  <a
                    href="https://openrouter.ai/models"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#818cf8] hover:text-[#4f46e5] transition-colors"
                  >
                    Browse OpenRouter Models →
                  </a>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full p-2.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-lg 
                     hover:opacity-90 focus:outline-none focus:ring-2 
                     focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1E1F2E]
                     transition-all duration-200 transform hover:scale-[0.98] mt-4"
          >
            Save Configuration
          </button>

          {saved && (
            <div className="flex items-center justify-center text-sm text-[#818cf8] animate-[fadeIn_0.3s_ease-out]">
              <svg
                className="w-4 h-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Settings saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
