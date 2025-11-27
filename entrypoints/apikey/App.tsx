import { apiKeyStore, type AiProvider } from "@/utils/store";
import { useEffect, useState } from "react";

function App() {
  const [googleKey, setGoogleKey] = useState("");
  const [googleModel, setGoogleModel] = useState("");
  const [googleVisionKey, setGoogleVisionKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [anthropicModel, setAnthropicModel] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [openrouterModel, setOpenrouterModel] = useState("");
  const [chromeKey, setChromeKey] = useState("");
  const [chromeModel, setChromeModel] = useState("");
  const [selectedProvider, setSelectedProvider] =
    useState<AiProvider>("chrome");
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing API keys on mount
    apiKeyStore.getValue().then((store) => {
      setGoogleKey(store.googleApiKey || "");
      setGoogleModel(store.googleModel || "gemini-flash-lite-latest");
      setGoogleVisionKey(store.googleVisionApiKey || "");
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
      googleVisionApiKey: googleVisionKey,
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
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16] p-6">
      <div className="relative p-8 w-[500px] bg-gradient-to-br from-[#1E1F2E] to-[#16172a] rounded-2xl shadow-2xl border border-[#2E2F3E]/80 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative mb-8 text-center">
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#4f46e5]/20 via-[#818cf8]/20 to-[#4f46e5]/20 blur-3xl animate-pulse"
            style={{ animationDuration: "3s" }}
          ></div>
          <div className="relative flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#818cf8] flex items-center justify-center shadow-xl shadow-[#4f46e5]/50 transform hover:scale-110 transition-transform duration-300">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-transparent bg-gradient-to-r from-[#818cf8] via-[#6366f1] to-[#4f46e5] bg-clip-text tracking-tight">
              AI Providers
            </h1>
          </div>
          <p className="text-xs font-medium tracking-wide text-gray-400">
            Configure your AI service
          </p>
          <div className="h-1 w-24 mx-auto mt-3 bg-gradient-to-r from-transparent via-[#4f46e5] to-transparent rounded-full shadow-lg shadow-[#4f46e5]/40"></div>
        </div>

        <div className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold tracking-wider text-gray-300 uppercase">
              Active Provider
            </label>
            <div className="grid grid-cols-2 gap-3 p-2 bg-[#0D0E16]/60 rounded-xl border border-[#2E2F3E]/60">
              {(
                [
                  { id: "google", name: "Google", icon: "🔷" },
                  { id: "openai", name: "OpenAI", icon: "🤖" },
                  { id: "anthropic", name: "Anthropic", icon: "🧠" },
                  { id: "openrouter", name: "OpenRouter", icon: "🔀" },
                ] as const
              ).map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`group px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2
                    ${
                      selectedProvider === provider.id
                        ? "bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white shadow-xl shadow-[#4f46e5]/30 scale-105"
                        : "text-gray-400 hover:text-gray-200 hover:bg-[#2E2F3E]/60 hover:scale-102"
                    }`}
                >
                  <span className="text-lg transition-transform transform group-hover:scale-110">
                    {provider.icon}
                  </span>
                  <span>{provider.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 border-t border-[#2E2F3E]/60 pt-6">
            {/* Google Section */}
            <div className={selectedProvider === "google" ? "block" : "hidden"}>
              <div className="space-y-4 p-5 bg-[#0D0E16]/40 rounded-xl border border-[#2E2F3E]/40">
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
                <div className="border-t border-[#2E2F3E]/60 pt-4">
                  <div className="mb-3 text-xs font-medium text-gray-400">
                    📷 Screen Chat Vision (Optional)
                  </div>
                  {renderKeyInput(
                    "Google Cloud Vision API Key",
                    googleVisionKey,
                    setGoogleVisionKey,
                    "googleVision",
                    "AIzaSy...",
                    "https://console.cloud.google.com/apis/credentials"
                  )}
                  <div className="flex gap-2 mt-2 text-xs">
                    <a
                      href="https://console.cloud.google.com/apis/library/vision.googleapis.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#34d399] rounded-lg transition-colors text-center font-medium border border-[#10b981]/30"
                    >
                      🎯 Enable Vision API
                    </a>
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#34d399] rounded-lg transition-colors text-center font-medium border border-[#10b981]/30"
                    >
                      🔑 Create API Key
                    </a>
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  <a
                    href="https://ai.google.dev/gemini-api/docs/models/gemini"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-[#4f46e5]/10 hover:bg-[#4f46e5]/20 text-[#818cf8] rounded-lg transition-colors text-center font-medium border border-[#4f46e5]/30"
                  >
                    📚 Model Docs
                  </a>
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-[#4f46e5]/10 hover:bg-[#4f46e5]/20 text-[#818cf8] rounded-lg transition-colors text-center font-medium border border-[#4f46e5]/30"
                  >
                    🚀 AI Studio
                  </a>
                </div>
              </div>
            </div>

            {/* OpenAI Section */}
            <div className={selectedProvider === "openai" ? "block" : "hidden"}>
              <div className="space-y-4 p-5 bg-[#0D0E16]/40 rounded-xl border border-[#2E2F3E]/40">
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
                <div className="flex gap-2 text-xs">
                  <a
                    href="https://platform.openai.com/docs/models"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#34d399] rounded-lg transition-colors text-center font-medium border border-[#10b981]/30"
                  >
                    📚 Model Docs
                  </a>
                  <a
                    href="https://platform.openai.com/usage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#34d399] rounded-lg transition-colors text-center font-medium border border-[#10b981]/30"
                  >
                    💳 Usage
                  </a>
                </div>
              </div>
            </div>

            {/* Anthropic Section */}
            <div
              className={selectedProvider === "anthropic" ? "block" : "hidden"}
            >
              <div className="space-y-4 p-5 bg-[#0D0E16]/40 rounded-xl border border-[#2E2F3E]/40">
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
                <div className="flex gap-2 text-xs">
                  <a
                    href="https://docs.anthropic.com/en/docs/about-claude/models"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 text-[#fbbf24] rounded-lg transition-colors text-center font-medium border border-[#f59e0b]/30"
                  >
                    📚 Model Docs
                  </a>
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 text-[#fbbf24] rounded-lg transition-colors text-center font-medium border border-[#f59e0b]/30"
                  >
                    🎛️ Console
                  </a>
                </div>
              </div>
            </div>

            {/* OpenRouter Section */}
            <div
              className={selectedProvider === "openrouter" ? "block" : "hidden"}
            >
              <div className="space-y-4 p-5 bg-[#0D0E16]/40 rounded-xl border border-[#2E2F3E]/40">
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
                <div className="flex gap-2 text-xs">
                  <a
                    href="https://openrouter.ai/models"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-[#ec4899]/10 hover:bg-[#ec4899]/20 text-[#f472b6] rounded-lg transition-colors text-center font-medium border border-[#ec4899]/30"
                  >
                    🔍 Browse Models
                  </a>
                  <a
                    href="https://openrouter.ai/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-[#ec4899]/10 hover:bg-[#ec4899]/20 text-[#f472b6] rounded-lg transition-colors text-center font-medium border border-[#ec4899]/30"
                  >
                    📚 Docs
                  </a>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full p-4 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-xl
                     hover:shadow-xl hover:shadow-[#4f46e5]/30 focus:outline-none focus:ring-2
                     focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1E1F2E]
                     transition-all duration-300 transform hover:scale-[1.02] mt-6
                     font-bold text-base border border-[#4f46e5]/30 flex items-center justify-center gap-2"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>Save Configuration</span>
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
