/// <reference types="wxt/browser" />
import { generateFormResponse } from "@/utils/ai/gemini";
import type { OutputFormat } from "@/utils/page-content"; // Import OutputFormat
import {
  addChatMessage,
  addInputText,
  addPageAssistantText,
  chatStore,
  lastUsedTextsStore,
  pageContextStore,
  searchSettingsStore,
} from "@/utils/store";
import React, { useEffect, useState } from "react";

interface InputInfo {
  value: string;
  placeholder: string;
  inputType: string;
  elementId: string;
  elementName: string;
}

export default function App() {
  const [inputPrompt, setInputPrompt] = useState("");
  const [inputInfo, setInputInfo] = useState<InputInfo | null>(null);
  const [isInputLoading, setIsInputLoading] = useState(false);
  const [lastInputTexts, setLastInputTexts] = useState<string[]>([]);
  const [showInputHistory, setShowInputHistory] = useState(false);

  // Close popup when window loses focus (user clicks away)
  useEffect(() => {
    const handleBlur = () => {
      // Small delay to allow clicking buttons within the popup
      setTimeout(() => {
        window.close();
      }, 100);
    };
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Load initial settings and page content
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const result = await browser.storage.local.get(["inputInfo"]);
        const lastUsed = await lastUsedTextsStore.getValue();
        setLastInputTexts(lastUsed.texts.inputTexts);

        console.log("[SamAI Input Assistant] Initial data loaded:", result);
        if (result.inputInfo) {
          const info = result.inputInfo as InputInfo;
          setInputInfo(info);
          console.log("[SamAI Input Assistant] Input info set:", info);
          // Pre-fill inputPrompt if an input field was clicked
          if (info.value) {
            setInputPrompt(`Refine "${info.value}"`);
          }
        } else {
          console.log("[SamAI Input Assistant] No input info found in storage.");
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []);

  const handleInputSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputPrompt.trim() || isInputLoading || !inputInfo) return;

    setIsInputLoading(true);
    try {
      const response = await generateFormResponse(inputPrompt);
      if (!response) {
        console.error("Error generating response");
        return;
      }

      await addInputText(inputPrompt); // Save input text

      await browser.runtime.sendMessage({
        type: "setInputValue",
        value: response,
      });

      setInputPrompt("");
      await browser.storage.local.remove("inputInfo");
      window.close();
    } catch (error) {
      console.error("Error processing input:", error);
    } finally {
      setIsInputLoading(false);
    }
  };

  return (
    <div
      id="samai-context-popup-root"
      className="min-w-[500px] h-[580px] bg-gradient-to-br from-[#1a1b2e]/95 to-[#0D0E16]/95 backdrop-blur-xl shadow-2xl p-6 text-gray-100 font-sans border border-[#2E2F3E]/50 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(26, 27, 46, 0.95) 0%, rgba(13, 14, 22, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex flex-col h-full space-y-6">
        <div
          className={`space-y-3 flex-none transition-all duration-300 ${!inputInfo ? "opacity-50 grayscale" : "opacity-100"}`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#818cf8] shadow-lg shadow-[#4f46e5]/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <h2 className="text-base font-bold tracking-tight text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text">
              Input Assistant
            </h2>
          </div>
          <form onSubmit={handleInputSubmit} className="flex flex-col gap-2">
            <div className="relative group">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onFocus={() => setShowInputHistory(true)}
                onBlur={() => setTimeout(() => setShowInputHistory(false), 100)}
               placeholder="Refine or generate text..."
                className="w-full px-4 py-3 bg-[#0D0E16]/50 border border-[#2E2F3E]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/50 focus:border-[#4f46e5]/50 focus:bg-[#0D0E16]/80 placeholder-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:border-[#4f46e5]/30 shadow-inner"
                disabled={!inputInfo || isInputLoading}
              />
              {showInputHistory &&
                lastInputTexts.length > 0 &&
                (() => {
                  const filteredInputTexts = lastInputTexts.filter((text) =>
                    text.toLowerCase().includes(inputPrompt.toLowerCase())
                  );
                  return (
                    filteredInputTexts.length > 0 && (
                      <div className="absolute z-10 w-full bg-[#1E1F2E]/95 backdrop-blur-xl border border-[#2E2F3E]/80 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-2xl shadow-black/50">
                        {filteredInputTexts.map((text, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 cursor-pointer hover:bg-[#2E2F3E] text-sm text-gray-300 hover:text-white transition-colors"
                            onClick={() => {
                              setInputPrompt(text);
                              setShowInputHistory(false);
                              handleInputSubmit();
                            }}
                          >
                            {text}
                          </div>
                        ))}
                      </div>
                    )
                  );
                })()}
            </div>
            <button
              type="submit"
              disabled={isInputLoading || !inputInfo}
              className={`w-full p-3 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white font-semibold rounded-xl 
                      hover:shadow-xl hover:shadow-[#4f46e5]/30 focus:outline-none focus:ring-2 
                      focus:ring-[#4f46e5]/50 focus:ring-offset-2 focus:ring-offset-transparent
                      transition-all duration-300 transform hover:scale-[0.99] active:scale-[0.97]
                      ${
                        isInputLoading || !inputInfo
                          ? "opacity-50 cursor-not-allowed shadow-none"
                          : "shadow-lg shadow-[#4f46e5]/20"
                      }`}
            >
              {isInputLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : inputInfo ? (
                "Generate & Insert"
              ) : (
                "Select an input field"
              )}
            </button>
          </form>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#2E2F3E] to-transparent"></div>

        <div className="relative flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#818cf8] to-[#c7d2fe] shadow-lg shadow-[#818cf8]/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h2 className="text-base font-bold tracking-tight text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text">
              Page Assistant
            </h2>
          </div>
          <form onSubmit={handlePageSubmit} className="flex flex-col gap-2">
            <div className="relative group">
              <input
                type="text"
                value={pagePrompt}
                onChange={(e) => setPagePrompt(e.target.value)}
                onFocus={() => setShowPageHistory(true)}
                onBlur={() => setTimeout(() => setShowPageHistory(false), 100)}
                placeholder="Ask about this page..."
                className="w-full px-4 py-3 bg-[#0D0E16]/50 border border-[#2E2F3E]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#818cf8]/50 focus:border-[#818cf8]/50 focus:bg-[#0D0E16]/80 placeholder-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:border-[#818cf8]/30 shadow-inner"
                disabled={isPageLoading}
              />
              {showPageHistory &&
                lastPageAssistantTexts.length > 0 &&
                (() => {
                  const filteredPageAssistantTexts =
                    lastPageAssistantTexts.filter((text) =>
                      text.toLowerCase().includes(pagePrompt.toLowerCase())
                    );
                  return (
                    filteredPageAssistantTexts.length > 0 && (
                      <div className="absolute z-10 w-full bg-[#1E1F2E]/95 backdrop-blur-xl border border-[#2E2F3E]/80 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-2xl shadow-black/50">
                        {filteredPageAssistantTexts.map((text, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 cursor-pointer hover:bg-[#2E2F3E] text-sm text-gray-300 hover:text-white transition-colors"
                            onClick={() => {
                              setPagePrompt(text);
                              setShowPageHistory(false);
                              handlePageSubmit();
                            }}
                          >
                            {text}
                          </div>
                        ))}
                      </div>
                    )
                  );
                })()}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPageLoading}
                className={`flex-1 p-3 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white font-semibold rounded-xl 
                          hover:shadow-xl hover:shadow-[#4f46e5]/30 focus:outline-none focus:ring-2 
                          focus:ring-[#4f46e5]/50 focus:ring-offset-2 focus:ring-offset-transparent
                          transition-all duration-300 transform hover:scale-[0.99] active:scale-[0.97]
                          ${
                            isPageLoading ? "opacity-50 cursor-not-allowed shadow-none" : "shadow-lg shadow-[#4f46e5]/20"
                          }`}
              >
                {isPageLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
                    <span>Thinking...</span>
                  </div>
                ) : (
                  "Ask"
                )}
              </button>
              <button
                onClick={() => {
                  setPagePrompt("summarize");
                  handlePageSubmit();
                }}
                type="button"
                className="flex-1 p-3 bg-[#2E2F3E]/80 text-gray-200 font-semibold rounded-xl hover:bg-[#3E3F4E] hover:text-white hover:shadow-lg hover:shadow-[#818cf8]/20 focus:outline-none focus:ring-2 focus:ring-[#818cf8]/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[0.99] active:scale-[0.97] border border-[#3E3F4E]/50"
              >
                Summarize
              </button>
            </div>
            <div className="flex rounded-xl overflow-hidden border border-[#2E2F3E]/50 text-xs bg-[#0D0E16]/30 p-1 backdrop-blur-sm">
              <button
                type="button"
                onClick={(e: React.MouseEvent) => {
                  handleScrapeModeChange("text");
                  if (e.button === 2) {
                    window.close();
                  }
                }}
                className={`flex-1 px-3 py-2 text-center font-semibold transition-all duration-200 rounded-lg
                          ${
                            scrapeMode === "text"
                              ? "bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white shadow-lg shadow-[#4f46e5]/30"
                              : "text-gray-400 hover:text-gray-200 hover:bg-[#2E2F3E]/50"
                          }`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={(e: React.MouseEvent) => {
                  handleScrapeModeChange("html");
                  if (e.button === 2) {
                    window.close();
                  }
                }}
                className={`flex-1 px-3 py-2 text-center font-semibold transition-all duration-200 rounded-lg
                          ${
                            scrapeMode === "html"
                              ? "bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white shadow-lg shadow-[#4f46e5]/30"
                              : "text-gray-400 hover:text-gray-200 hover:bg-[#2E2F3E]/50"
                          }`}
              >
                HTML
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
