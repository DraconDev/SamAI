import { useState, useEffect } from "react";
import { apiKeyStore } from "@/utils/store";

function App() {
  const [showApiLink, setShowApiLink] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing API key on mount
    apiKeyStore.getValue().then((store) => {
      setApiKey(store.apiKey);
      setShowApiLink(!store.apiKey);
    });
  }, []);

  const handleSave = async () => {
    await apiKeyStore.setValue({ apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const maskedApiKey = showKey ? apiKey : apiKey.replace(/./g, "•");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16]">
      <div className="relative p-8 w-[400px] bg-[#1E1F2E] rounded-lg shadow-2xl border border-[#2E2F3E]">
        {showApiLink && (
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute text-sm font-medium text-[#818cf8] top-4 right-4 hover:text-[#4f46e5] transition-colors"
          >
            Get API Key
          </a>
        )}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text">
            API Key Configuration
          </h1>
          <div className="h-0.5 w-16 mx-auto mt-3 bg-gradient-to-r from-[#4f46e5] to-[#818cf8]"></div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-300"
            >
              Enter your API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#1a1b2e] border border-[#2E2F3E] rounded-lg shadow-sm 
                         text-gray-100 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5]
                         transition-all duration-200"
                placeholder="sk-..."
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
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
                  {showKey ? (
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22" />
                  ) : (
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 0 1 0 6 3 3 0 0 1 0-6z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full p-2.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-lg 
                     hover:opacity-90 focus:outline-none focus:ring-2 
                     focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1E1F2E]
                     transition-all duration-200 transform hover:scale-[0.98]"
          >
            Save API Key
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
              API key saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
