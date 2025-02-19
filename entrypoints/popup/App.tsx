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
      <h1 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Sam AI Assistant
      </h1>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm">
          <label className="text-gray-700 font-medium">Search Enhancement</label>
          <button
            onClick={toggleSearch}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              searchActive ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
