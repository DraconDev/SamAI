import { useEffect, useState } from "react";
import { tabs } from "webextension-polyfill";

function App() {
  useEffect(() => {
    console.log("[SamAI Popup] Extension loaded");
  }, []);

  const openApiKeyPage = () => {
    tabs.create({ url: "apikey.html" });
  };

  const openDonateLink = () => {
    tabs.create({ url: "https://ko-fi.com/adamdracon" });
  };

  return (
    <div className="p-6 w-[360px] bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16] text-gray-100 shadow-2xl min-h-[400px]">
      {/* Header with animated gradient */}
      <div className="relative mb-8 text-center">
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
        <p className="text-sm font-medium tracking-wide text-gray-400">AI-Powered Search & Chat Assistant</p>
        <div className="h-1 w-24 mx-auto mt-3 bg-gradient-to-r from-transparent via-[#4f46e5] to-transparent rounded-full shadow-lg shadow-[#4f46e5]/40"></div>
      </div>

      {/* Status Card */}
      <div className="mb-8 p-5 bg-gradient-to-br from-[#1E1F2E] to-[#16172a] rounded-2xl border border-[#2E2F3E]/80 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 border rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-100">Extension Active</h3>
            <p className="text-xs text-gray-400">Search and chat features available in sidebar</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
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

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Find the SamAI sidebar on any web page to get started
        </p>
      </div>
    </div>
  );
}

export default App;
