/// <reference types="wxt/browser" />
import { generateFormResponse } from "@/utils/ai/gemini";
import {
  addInputText,
  lastUsedTextsStore,
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
      className="w-[480px] h-[300px] bg-gradient-to-br from-[#1a1b2e]/95 to-[#0D0E16]/95 backdrop-blur-xl shadow-2xl p-6 text-gray-100 font-sans border border-[#2E2F3E]/50 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(26, 27, 46, 0.95) 0%, rgba(13, 14, 22, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex flex-col h-full space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#818cf8] shadow-xl shadow-[#4f46e5]/50 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-black text-transparent bg-gradient-to-r from-[#818cf8] via-[#6366f1] to-[#4f46e5] bg-clip-text tracking-tight">
              Input Assistant
            </h1>
          </div>
          <p className="text-xs font-medium tracking-wide text-gray-400">
            {inputInfo ? "AI-powered text refinement for your input field" : "Right-click on an input field to get started"}
          </p>
        </div>

        <form onSubmit={handleInputSubmit} className="flex flex-col flex-1 gap-4">
          <div className="relative group">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onFocus={() => setShowInputHistory(true)}
              onBlur={() => setTimeout(() => setShowInputHistory(false), 100)}
              placeholder={inputInfo ? "Refine or generate text..." : "Select an input field first"}
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
            className={`w-full p-4 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white font-bold rounded-xl text-base
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
                <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
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
    </div>
  );
}
