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

interface SmartPreset {
  id: string;
  name: string;
  prompt: string;
  icon: string;
  description: string;
}

const smartPresets: SmartPreset[] = [
  {
    id: "professional-email",
    name: "Professional Email",
    prompt: "Write a professional and polite email",
    icon: "✉️",
    description: "Formal communication style"
  },
  {
    id: "product-description",
    name: "Product Description",
    prompt: "Create an engaging product description highlighting key benefits",
    icon: "📦",
    description: "Marketing-focused content"
  },
  {
    id: "business-name",
    name: "Business Name",
    prompt: "Suggest creative and memorable business names",
    icon: "🏢",
    description: "Creative naming solutions"
  },
  {
    id: "refine-text",
    name: "Refine Text",
    prompt: "Improve the clarity, grammar, and style of this text",
    icon: "✏️",
    description: "Polish existing content"
  }
];

export default function App() {
  const [inputPrompt, setInputPrompt] = useState("");
  const [inputInfo, setInputInfo] = useState<InputInfo | null>(null);
  const [isInputLoading, setIsInputLoading] = useState(false);
  const [lastInputTexts, setLastInputTexts] = useState<string[]>([]);
  const [showInputHistory, setShowInputHistory] = useState(false);
  const [suggestedPrompt, setSuggestedPrompt] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const [showPresets, setShowPresets] = useState(true);

  // Context detection
  const detectContext = (info: InputInfo): string => {
    const { placeholder, elementName, inputType } = info;
    const text = `${placeholder} ${elementName} ${inputType}`.toLowerCase();
    
    if (text.includes('email') || text.includes('mail')) {
      return '📧 Email address';
    }
    if (text.includes('name') || text.includes('first') || text.includes('last')) {
      return '👤 Name field';
    }
    if (text.includes('phone') || text.includes('tel') || text.includes('mobile')) {
      return '📞 Phone number';
    if (text.includes('address') || text.includes('street')) {
      return '📍 Address field';
    }
    if (text.includes('company') || text.includes('business') || text.includes('organization')) {
      return '🏢 Company/Business';
    }
    if (text.includes('product') || text.includes('item') || text.includes('title')) {
      return '📦 Product/Title';
    }
    if (text.includes('description') || text.includes('message') || text.includes('comment')) {
      return '💬 Description/Message';
    }
    return '📝 Text input';
  };

  // Close popup when window loses focus
  useEffect(() => {
    const handleBlur = () => {
      setTimeout(() => {
        window.close();
      }, 100);
    };
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Load initial data and suggest prompts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const result = await browser.storage.local.get(["inputInfo"]);
        const lastUsed = await lastUsedTextsStore.getValue();
        setLastInputTexts(lastUsed.texts.inputTexts);

        if (result.inputInfo) {
          const info = result.inputInfo as InputInfo;
          setInputInfo(info);
          
          // Smart context detection
          const context = detectContext(info);
          setSuggestedPrompt(context);
          
          // Pre-fill inputPrompt if an input field was clicked
          if (info.value) {
            setInputPrompt(`Refine "${info.value}"`);
            setCharacterCount(info.value.length);
          } else {
            setInputPrompt(`Write a professional ${context.toLowerCase()}`);
            setCharacterCount(0);
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []);

  // Update character count
  useEffect(() => {
    setCharacterCount(inputPrompt.length);
  }, [inputPrompt]);

  const handlePresetSelect = (preset: SmartPreset) => {
    if (inputInfo?.value) {
      setInputPrompt(`Refine this ${inputInfo.value} with the following prompt: ${preset.prompt}`);
    } else {
      setInputPrompt(preset.prompt);
    }
    setShowPresets(false);
  };

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
      className="w-[600px] h-[450px] bg-gradient-to-br from-[#1a1b2e]/95 to-[#0D0E16]/95 backdrop-blur-xl shadow-2xl text-gray-100 font-sans border border-[#2E2F3E]/50 rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(26, 27, 46, 0.95) 0%, rgba(13, 14, 22, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#2E2F3E]/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#818cf8] shadow-xl shadow-[#4f46e5]/50 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-black text-transparent bg-gradient-to-r from-[#818cf8] via-[#6366f1] to-[#4f46e5] bg-clip-text tracking-tight">
                  Input Assistant
                </h1>
                <p className="text-xs text-gray-400">
                  {inputInfo ? detectContext(inputInfo) : "Right-click on an input field"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-[#2E2F3E]/50 rounded-lg transition-all duration-200"
            >
              {showPresets ? "Hide Presets" : "Show Presets"}
            </button>
          </div>
        </div>

        {/* Smart Presets */}
        {showPresets && (
          <div className="px-6 py-4 border-b border-[#2E2F3E]/30">
            <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-300">
              <span className="text-[#4f46e5]">⚡</span>
              Smart Presets
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {smartPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className="flex items-center gap-3 p-3 bg-[#0D0E16]/50 hover:bg-[#2E2F3E]/50 border border-[#2E2F3E]/30 hover:border-[#4f46e5]/30 rounded-xl transition-all duration-200 text-left group"
                >
                  <span className="text-lg">{preset.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-200 group-hover:text-white">
                      {preset.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {preset.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col flex-1 gap-4 p-6">
          {/* Input Area */}
          <form onSubmit={handleInputSubmit} className="flex flex-col flex-1 gap-4">
            <div className="relative group">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  {inputInfo?.value ? "Refine existing content" : "Describe what you need"}
                </label>
                <div className="text-xs text-gray-500">
                  {characterCount} characters
                </div>
              </div>
              
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onFocus={() => setShowInputHistory(true)}
                onBlur={() => setTimeout(() => setShowInputHistory(false), 100)}
                placeholder={inputInfo ? "Refine or generate text..." : "Select an input field first"}
                className="w-full px-4 py-3 bg-[#0D0E16]/50 border border-[#2E2F3E]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/50 focus:border-[#4f46e5]/50 focus:bg-[#0D0E16]/80 placeholder-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm resize-none hover:border-[#4f46e5]/30 shadow-inner"
                rows={3}
                disabled={!inputInfo || isInputLoading}
              />
              
              {/* Input History Dropdown */}
              {showInputHistory &&
                lastInputTexts.length > 0 &&
                (() => {
                  const filteredInputTexts = lastInputTexts.filter((text) =>
                    text.toLowerCase().includes(inputPrompt.toLowerCase())
                  );
                  return (
                    filteredInputTexts.length > 0 && (
                      <div className="absolute z-10 w-full bg-[#1E1F2E]/95 backdrop-blur-xl border border-[#2E2F3E]/80 rounded-xl mt-1 max-h-40 overflow-y-auto shadow-2xl shadow-black/50">
                        {filteredInputTexts.map((text, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 cursor-pointer hover:bg-[#2E2F3E] text-sm text-gray-300 hover:text-white transition-colors"
                            onClick={() => {
                              setInputPrompt(text);
                              setShowInputHistory(false);
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

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2">
              {inputInfo?.value && (
                <button
                  type="button"
                  onClick={() => setInputPrompt(`Make this more professional: "${inputInfo.value}"`)}
                  className="px-3 py-1.5 text-xs font-medium bg-[#4f46e5]/20 hover:bg-[#4f46e5]/30 text-[#818cf8] border border-[#4f46e5]/30 rounded-lg transition-all duration-200"
                >
                  ✨ Make Professional
                </button>
              )}
              <button
                type="button"
                onClick={() => setInputPrompt(`Create concise and clear text for: ${suggestedPrompt}`)}
                className="px-3 py-1.5 text-xs font-medium bg-[#059669]/20 hover:bg-[#059669]/30 text-[#34d399] border border-[#059669]/30 rounded-lg transition-all duration-200"
              >
                🎯 Make Concise
              </button>
              <button
                type="button"
                onClick={() => setInputPrompt(`Expand this into detailed content: ${inputInfo?.value || suggestedPrompt}`)}
                className="px-3 py-1.5 text-xs font-medium bg-[#dc2626]/20 hover:bg-[#dc2626]/30 text-[#f87171] border border-[#dc2626]/30 rounded-lg transition-all duration-200"
              >
                📝 Expand Detail
              </button>
            </div>
            
            {/* Generate Button */}
            <button
              type="submit"
              disabled={isInputLoading || !inputInfo || !inputPrompt.trim()}
              className={`w-full p-4 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white font-bold rounded-xl text-base
                        hover:shadow-xl hover:shadow-[#4f46e5]/30 focus:outline-none focus:ring-2 
                        focus:ring-[#4f46e5]/50 focus:ring-offset-2 focus:ring-offset-transparent
                        transition-all duration-300 transform hover:scale-[0.99] active:scale-[0.97]
                        ${
                          isInputLoading || !inputInfo || !inputPrompt.trim()
                            ? "opacity-50 cursor-not-allowed shadow-none"
                            : "shadow-lg shadow-[#4f46e5]/20"
                        }`}
            >
              {isInputLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
                  <span>Generating...</span>
                </div>
              ) : inputInfo && inputPrompt.trim() ? (
                "Generate & Insert"
              ) : inputInfo ? (
                "Type your request above"
              ) : (
                "Select an input field first"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
