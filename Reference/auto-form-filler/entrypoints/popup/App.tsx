import { useState, useEffect } from "react";
import { Env } from "@/types/types";
import { env as envStore } from "@/utils/store";
import Description from "@/components/Description";
import { Button } from "@/components/ui/button";

function App() {
  const [state, setState] = useState<Env | null>(null);
  const [env, setEnv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (!state) {
      (async () => {
        const currentState = await envStore.getValue();
        setState(currentState);
      })();
    }
    envStore.watch((newValue) => {
      if (newValue) {
        setState(newValue);
      }
    });
  }, []);

  const handleFillForm = async () => {
    debugger;
    try {
      setLoading(true);
      setError(null);
      const activeTab = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!activeTab[0]?.id) return;

      await chrome.tabs.sendMessage(activeTab[0].id, {
        action: "fillForm",
        prompt: prompt,
      });
    } catch (error) {
      console.error(error);
      setError("Failed to fill form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-80">
      {/* Form Filling Section */}
      {state?.env && (
        <div className="p-3 space-y-3 bg-white rounded-md shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">Form Filling</h2>
          <Description />
          <div className="space-y-3">
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[100px] text-gray-800"
              placeholder="Enter your prompt here..."
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button
              onClick={handleFillForm}
              className="w-full py-2 font-semibold text-white transition duration-200 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? "Filling Form..." : "Fill Form"}
            </Button>
            {/* Donate Button */}
            <Button
              onClick={() =>
                window.open("https://ko-fi.com/adamdracon", "_blank")
              }
              className="w-full py-1 font-semibold text-gray-700 transition duration-200 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              Donate
            </Button>
            {error && (
              <p className="mt-2 text-sm text-center text-red-600">{error}</p>
            )}
          </div>
        </div>
      )}

      {/* API Key Section */}
      <div className="p-3 space-y-3 bg-white rounded-md shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Gemini API Key</h2>
          <div>
            {state && state.env.length == 0 && (
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                className="text-sm text-blue-600 hover:underline"
              >
                Get Key
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-3">
          <input
            type="password"
            className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Enter API Key"
            value={env}
            onChange={(e) => setEnv(e.target.value)}
          />
          <Button
            onClick={() => {
              envStore.setValue({ env: env });
              setEnv("");
            }}
            className="w-full py-2 font-semibold text-white transition duration-200 bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
          >
            Set API Key
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
