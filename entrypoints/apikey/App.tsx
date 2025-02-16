import { useState, useEffect } from "react";
import { apiKeyStore } from "@/utils/store";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing API key on mount
    apiKeyStore.getValue().then(store => {
      setApiKey(store.apiKey);
    });
  }, []);

  const handleSave = async () => {
    await apiKeyStore({ apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 w-[400px] bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <h1 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        API Key Configuration
      </h1>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            Enter your API Key
          </label>
          <input
            type="text"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none 
                     focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="sk-..."
          />
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
          <p className="text-green-600 text-sm text-center animate-fade-in">
            API key saved successfully!
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
