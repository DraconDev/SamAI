import { useEffect, useState } from "react";
import { tabs } from "webextension-polyfill";
import { ToggleButton } from "../../src/components/ToggleButton";
import type { OutputFormat } from "../../utils/page-content"; // Import OutputFormat
import { searchSettingsStore, type PromptStyle } from "../../utils/store";

function App() {
  const [searchActive, setSearchActive] = useState(true);
  const [promptStyle, setPromptStyle] = useState<PromptStyle>("short");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("text");
  const [showFloatingIcon, setShowFloatingIcon] = useState(true);

  useEffect(() => {
    searchSettingsStore.getValue().then((settings) => {
      console.log("[SamAI Popup] Loaded settings:", settings);
      setSearchActive(settings.searchActive);
      setPromptStyle(settings.promptStyle);
      setOutputFormat(settings.outputFormat);
      setShowFloatingIcon(settings.showFloatingIcon);
    });
  }, []);

  const toggleSearch = async () => {
    const newValue = !searchActive;
    await searchSettingsStore.setValue({
      searchActive: newValue,
      promptStyle,
      outputFormat,
      showFloatingIcon,
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
    <div className="p-6 w-[360px] bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16] text-gray-100 shadow-2xl min-h-[500px]">
      {/* Header with animated gradient */}
      <div className="relative mb-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4f46e5]/20 via-[#818cf8]/20 to-[#4f46e5]/20 blur-3xl animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="relative flex items-center justify-center gap-3 mb-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#818cf8] shadow-xl shadow-[#4f46e5]/50 transform hover:scale-110 transition-transform duration-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
              <path d="M2 17L12 22L22 17"/>
              <path d="M2 12L12 17L22 12"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black text-transparent bg-gradient-to-r from-[#818cf8] via-[#6366f1] to-[#4f46e5] bg-clip-text tracking-tight">
            Sam AI
          </h1>
        </div>
        <p className="text-xs font-medium tracking-wide text-gray-400">Your AI-Powered Search Assistant</p>
        <div className="h-1 w-24 mx-auto mt-3 bg-gradient-to-r from-transparent via-[#4f46e5] to-transparent rounded-full shadow-lg shadow-[#4f46e5]/40"></div>
      </div>

      <div className="space-y-4">
        {/* Search Enhancement Card */}
        <div className="flex flex-col gap-4 p-5 bg-gradient-to-br from-[#1E1F2E] to-[#16172a] rounded-2xl border border-[#2E2F3E]/80 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f46e5]/20 to-[#818cf8]/20 flex items-center justify-center border border-[#4f46e5]/30">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <label className="text-sm font-bold text-gray-100">
                Search Enhancement
              </label>
            </div>
            <ToggleButton
              isEnabled={searchActive}
              onToggle={toggleSearch}
              ariaLabel={
                searchActive
                  ? "Disable search enhancement"
                  : "Enable search enhancement"
              }
            />
          </div>

          {searchActive && (
            <div className="pt-4 border-t border-[#2E2F3E]/60">
              <label className="block mb-3 text-xs font-bold tracking-wider text-gray-300 uppercase">
                Response Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    value: "short",
                    label: "Short",
                    icon: "⚡",
                    desc: "Quick & concise",
                  },
                  {
                    value: "medium",
                    label: "Medium",
                    icon: "⚖️",
                    desc: "Balanced info",
                  },
                  {
                    value: "long",
                    label: "Long",
                    icon: "📚",
                    desc: "In-depth analysis",
                  },
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
                    outputFormat,
                    showFloatingIcon,
                  });
                    }}
                    className={`group relative flex flex-col items-center p-3 rounded-xl border transition-all duration-300
                              hover:transform hover:scale-105 hover:shadow-xl
                              ${
                                promptStyle === value
                                  ? "border-[#4f46e5] bg-gradient-to-br from-[#4f46e5]/25 to-[#818cf8]/15 shadow-xl shadow-[#4f46e5]/30"
                                  : "border-[#2E2F3E]/60 hover:border-[#4f46e5]/60 hover:bg-[#4f46e5]/10"
                              }`}
                  >
                    <span className="mb-1 text-lg transition-transform transform group-hover:scale-110">
                      {icon}
                    </span>
                    <span
                      className={`text-xs font-medium mb-0.5
                                   ${
                                     promptStyle === value
                                       ? "text-[#818cf8]"
                                       : "text-gray-400 group-hover:text-[#818cf8]"
                                   }
                                   transition-colors`}
                    >
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


        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => tabs.create({ url: "chat.html" })}
            className="group w-full p-4 bg-gradient-to-r from-[#10b981] to-[#34d399] text-white rounded-xl
                     hover:shadow-xl hover:shadow-green-500/30 focus:outline-none focus:ring-2
                     focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                     transition-all duration-300 transform hover:scale-[1.02]
                     font-bold flex items-center justify-center gap-3 border border-green-500/30"
          >
            <svg
              className="w-5 h-5 transition-transform transform group-hover:rotate-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Open SamAI Chat</span>
          </button>

          <button
            onClick={openApiKeyPage}
            className="group w-full p-4 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-xl
                     hover:shadow-xl hover:shadow-[#4f46e5]/30 focus:outline-none focus:ring-2
                     focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                     transition-all duration-300 transform hover:scale-[1.02]
                     font-bold flex items-center justify-center gap-3 border border-[#4f46e5]/30"
          >
            <svg
              className="w-5 h-5 transition-transform transform group-hover:rotate-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            <span>Configure API Key</span>
          </button>

          <button
            onClick={openDonateLink}
            className="group w-full p-4 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-white rounded-xl
                     hover:shadow-xl hover:shadow-yellow-500/30 focus:outline-none focus:ring-2
                     focus:ring-[#f59e0b] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                     transition-all duration-300 transform hover:scale-[1.02]
                     font-bold flex items-center justify-center gap-3 border border-yellow-500/30"
          >
            <span className="text-xl transition-transform transform group-hover:scale-125">☕</span>
            <span>Support Development</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
