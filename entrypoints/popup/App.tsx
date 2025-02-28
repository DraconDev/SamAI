import { tabs } from "webextension-polyfill";
import { useEffect, useState } from "react";
import { searchSettingsStore, type PromptStyle } from "../../utils/store";

function App() {
  const [searchActive, setSearchActive] = useState(true);
  const [promptStyle, setPromptStyle] = useState<PromptStyle>("short");

  useEffect(() => {
    searchSettingsStore.getValue().then(settings => {
      setSearchActive(settings.searchActive);
      setPromptStyle(settings.promptStyle);
    });
  }, []);

  const toggleSearch = async () => {
    const newValue = !searchActive;
    await searchSettingsStore.setValue({ 
      searchActive: newValue,
      promptStyle 
    });
    setSearchActive(newValue);
  };

  const openApiKeyPage = () => {
    tabs.create({ url: "apikey.html" });
  };

  return (
    <div className="p-6 w-[300px] bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16] text-gray-100">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text">
          Sam AI Assistant
        </h1>
        <div className="h-0.5 w-16 mx-auto mt-2 bg-gradient-to-r from-[#4f46e5] to-[#818cf8]"></div>
      </div>
      
      <div className="space-y-5">
        <div className="flex flex-col gap-4 p-3 bg-[#1E1F2E] rounded-lg border border-[#2E2F3E]">
          <div className="flex items-center justify-between">
            <label className="font-medium text-gray-300">Search Enhancement</label>
            <button
              onClick={toggleSearch}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 
                         ${searchActive ? 'bg-[#4f46e5]' : 'bg-gray-600'} 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1E1F2E] focus:ring-[#4f46e5]`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 
                           ${searchActive ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {searchActive && (
            <div className="pt-2 border-t border-[#2E2F3E]">
              <label className="block mb-2 text-sm font-medium text-gray-300">Response Style</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="promptStyle"
                    value="short"
                    checked={promptStyle === "short"}
                    onChange={(e) => {
                      const newStyle = e.target.value as PromptStyle;
                      setPromptStyle(newStyle);
                      searchSettingsStore.setValue({
                        searchActive,
                        promptStyle: newStyle
                      });
                    }}
                    className="w-4 h-4 text-[#4f46e5] bg-gray-700 border-[#2E2F3E] focus:ring-[#4f46e5] focus:ring-offset-[#1E1F2E]"
                  />
                  <span className="ml-2 text-sm text-gray-300">Short & Concise</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="promptStyle"
                    value="medium"
                    checked={promptStyle === "medium"}
                    onChange={(e) => {
                      const newStyle = e.target.value as PromptStyle;
                      setPromptStyle(newStyle);
                      searchSettingsStore.setValue({
                        searchActive,
                        promptStyle: newStyle
                      });
                    }}
                    className="w-4 h-4 text-[#4f46e5] bg-gray-700 border-[#2E2F3E] focus:ring-[#4f46e5] focus:ring-offset-[#1E1F2E]"
                  />
                  <span className="ml-2 text-sm text-gray-300">Medium & Balanced</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="promptStyle"
                    value="long"
                    checked={promptStyle === "long"}
                    onChange={(e) => {
                      const newStyle = e.target.value as PromptStyle;
                      setPromptStyle(newStyle);
                      searchSettingsStore.setValue({
                        searchActive,
                        promptStyle: newStyle
                      });
                    }}
                    className="w-4 h-4 text-[#4f46e5] bg-gray-700 border-[#2E2F3E] focus:ring-[#4f46e5] focus:ring-offset-[#1E1F2E]"
                  />
                  <span className="ml-2 text-sm text-gray-300">Long & Detailed</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={openApiKeyPage}
          className="w-full p-2.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-lg 
                   hover:opacity-90 focus:outline-none focus:ring-2 
                   focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                   transition-all duration-200 transform hover:scale-[0.98]
                   font-medium"
        >
          Configure API Key
        </button>

      </div>
    </div>
  );
}

export default App;
