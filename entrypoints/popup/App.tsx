import { tabs } from "webextension-polyfill";
import { useEffect, useState } from "react";
import { searchSettingsStore } from "../../utils/store";

function App() {
  const [searchActive, setSearchActive] = useState(true);

  useEffect(() => {
    searchSettingsStore.getValue().then(settings => {
      setSearchActive(settings.searchActive);
    });
  }, []);

  const toggleSearch = async () => {
    const newValue = !searchActive;
    await searchSettingsStore.setValue({ searchActive: newValue });
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
        <div className="flex items-center justify-between p-3 bg-[#1E1F2E] rounded-lg border border-[#2E2F3E]">
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
