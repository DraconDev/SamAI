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

  const maskedApiKey = showKey ? apiKey : apiKey.replace(/./g, '•');

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative p-6 w-[400px] bg-gradient-to-br from-indigo-100 via-white to-purple-100 rounded-lg shadow-xl">
        {showApiLink && (
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute text-sm font-medium text-indigo-600 top-2 right-4 hover:text-indigo-800"
          >
            Get API Key
          </a>
        )}
        <h1 className="mb-6 text-2xl font-bold text-center text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
          API Key Configuration
        </h1>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700"
            >
              Enter your API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="sk-..."
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute text-gray-500 transform -translate-y-1/2 right-2 top-1/2 hover:text-gray-700"
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md
                   font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 
                   transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save API Key
          </button>

          {saved && (
            <p className="text-sm text-center text-green-600 animate-fade-in">
              API key saved successfully!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
