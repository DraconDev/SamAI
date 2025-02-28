import { tabs } from "webextension-polyfill";
import { useEffect, useState } from "react";
import { searchSettingsStore, type PromptStyle } from "../../utils/store";

function App() {
  const [searchActive, setSearchActive] = useState(true);
  const [promptStyle, setPromptStyle] = useState<PromptStyle>("short");
  const [continuePreviousChat, setContinuePreviousChat] = useState(true);

  useEffect(() => {
    searchSettingsStore.getValue().then(settings => {
      setSearchActive(settings.searchActive);
      setPromptStyle(settings.promptStyle);
      setContinuePreviousChat(settings.continuePreviousChat);
    });
  }, []);

  const toggleSearch = async () => {
    const newValue = !searchActive;
    await searchSettingsStore.setValue({ 
      searchActive: newValue,
      promptStyle,
      continuePreviousChat
    });
    setSearchActive(newValue);
  };

  const openApiKeyPage = () => {
    tabs.create({ url: "apikey.html" });
  };

  const openDonateLink = () => {
    tabs.create({ url: "https://ko-fi.com/adamdracon" });
  };

  return (
    <div className="p-6 w-[300px] bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16] text-gray-100">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text">
          Sam AI
        </h1>
        <div className="h-0.5 w-16 mx-auto mt-2 bg-gradient-to-r from-[#4f46e5] to-[#818cf8]"></div>
        <p className="mt-2 text-xs font-medium text-gray-400">Settings</p>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-sm font-medium tracking-wide text-gray-400 uppercase">General Settings</h2>
        <div className="flex flex-col gap-3 p-4 bg-[#1E1F2E] rounded-lg border border-[#2E2F3E]">
          <div className="flex items-center justify-between">
            <label className="font-medium text-gray-300">Search Enhancement</label>
            <button
              onClick={toggleSearch}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 
                         ${searchActive ? 'bg-[#4f46e5] ring-2 ring-[#4f46e5]/50' : 'bg-gray-600'} 
                         focus:outline-none focus:ring-2 focus:ring-[#4f46e5] hover:opacity-90`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 
                           ${searchActive ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {searchActive && (
            <div className="pt-3 border-t border-[#2E2F3E]">
              <label className="block mb-3 text-sm font-medium text-gray-300">Response Style</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: 'short', label: 'Short', icon: '⚡', desc: 'Quick & concise' },
                  { value: 'medium', label: 'Medium', icon: '⚖️', desc: 'Balanced info' },
                  { value: 'long', label: 'Long', icon: '📚', desc: 'In-depth analysis' }
                ].map(({ value, label, icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      const newStyle = value as PromptStyle;
                      setPromptStyle(newStyle);
                      searchSettingsStore.setValue({
                        searchActive,
                        promptStyle: newStyle,
                        continuePreviousChat
                      });
                    }}
                    className={`group relative flex flex-col items-center p-2 rounded-lg border transition-all duration-200
                              hover:transform hover:scale-[1.02]
                              ${promptStyle === value 
                                ? 'border-[#4f46e5] bg-[#4f46e5]/10' 
                                : 'border-[#2E2F3E] hover:border-[#4f46e5] hover:bg-[#4f46e5]/5'}`}
                  >
                    <span className="mb-1 text-lg transition-transform transform group-hover:scale-110">{icon}</span>
                    <span className={`text-xs font-medium mb-0.5
                                   ${promptStyle === value ? 'text-[#818cf8]' : 'text-gray-400 group-hover:text-[#818cf8]'}
                                   transition-colors`}>
                      {label}
                    </span>
                    <span className="text-[10px] text-gray-500 transition-colors group-hover:text-gray-400">
                      {desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <h2 className="mt-6 text-sm font-medium tracking-wide text-gray-400 uppercase">Chat Settings</h2>
        <div className="flex items-center justify-between p-4 bg-[#1E1F2E] rounded-lg border border-[#2E2F3E]">
          <div className="flex flex-col gap-0.5">
            <label className="font-medium text-gray-300">Continue Previous Chat</label>
            <span className="text-xs text-gray-500">Keep chat history between sessions</span>
          </div>
          <button
            aria-label={continuePreviousChat ? "Disable chat continuation" : "Enable chat continuation"}
            onClick={() => {
              const newValue = !continuePreviousChat;
              setContinuePreviousChat(newValue);
              searchSettingsStore.setValue({
                searchActive,
                promptStyle,
                continuePreviousChat: newValue
              });
            }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 
                       ${continuePreviousChat ? 'bg-[#4f46e5] ring-2 ring-[#4f46e5]/50' : 'bg-gray-600'} 
                       focus:outline-none focus:ring-2 focus:ring-[#4f46e5] hover:opacity-90`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 
                         ${continuePreviousChat ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        <div className="flex flex-col gap-3 mt-8 pt-4 border-t border-[#2E2F3E]">
          <button
            onClick={openApiKeyPage}
            className="w-full p-2.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-lg 
                     hover:opacity-90 focus:outline-none focus:ring-2 
                     focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                     transition-all duration-200 transform hover:scale-[0.98]
                     font-medium flex items-center justify-center gap-2"
          >
            <span>Configure API Key</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </button>

          <button
            onClick={openDonateLink}
            className="w-full p-2.5 bg-gradient-to-r from-[#4f46e5]/20 to-[#818cf8]/20 text-[#818cf8] rounded-lg 
                     hover:from-[#4f46e5]/30 hover:to-[#818cf8]/30
                     focus:outline-none focus:ring-2 
                     focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                     transition-all duration-200 transform hover:scale-[0.98]
                     font-medium flex items-center justify-center gap-2"
          >
            <span>Support Development</span>
            <span className="text-lg">☕</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
