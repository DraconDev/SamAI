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
    <div className="p-4 w-[300px] bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <h1 className="mb-4 text-xl font-bold text-center text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
        Sam AI Assistant
      </h1>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm">
          <label className="font-medium text-gray-700">Search Enhancement</label>
          <button
            onClick={toggleSearch}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              searchActive ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                searchActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <button
          onClick={openApiKeyPage}
          className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md
                   font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 
                   transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Configure API Key
        </button>

      </div>
    </div>
  );
}

export default App;
