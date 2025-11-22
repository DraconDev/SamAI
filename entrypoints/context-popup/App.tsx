/// <reference types="wxt/browser" />
import { generateFormResponse } from "@/utils/ai/gemini";
import { OutputFormat } from "@/utils/page-content"; // Import OutputFormat
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
  const [pagePrompt, setPagePrompt] = useState("");
  const [inputInfo, setInputInfo] = useState<InputInfo | null>(null);
  const [pageBodyText, setPageBodyText] = useState(""); // Store body text
  const [pageOptimizedHtml, setPageOptimizedHtml] = useState(""); // Store optimized HTML
  const [isInputLoading, setIsInputLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [scrapeMode, setScrapeMode] = useState<OutputFormat>("text"); // Default to "text"
  const [lastInputTexts, setLastInputTexts] = useState<string[]>([]);
  const [lastPageAssistantTexts, setLastPageAssistantTexts] = useState<
    string[]
  >([]);
  const [showInputHistory, setShowInputHistory] = useState(false);
  const [showPageHistory, setShowPageHistory] = useState(false);

  // Load initial settings and page content
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const result = await browser.storage.local.get([
          "inputInfo",
          "pageBodyText", // Load body text
          "pageOptimizedHtml", // Load optimized HTML
        ]);
        const lastUsed = await lastUsedTextsStore.getValue();
        setLastInputTexts(lastUsed.texts.inputTexts);
        setLastPageAssistantTexts(lastUsed.texts.pageAssistantTexts);

        console.log("[SamAI Context Popup] Initial data loaded:", result);
        if (result.inputInfo) {
          const info = result.inputInfo as InputInfo;
          setInputInfo(info);
          console.log("[SamAI Context Popup] Input info set:", info);
          // Pre-fill inputPrompt if an input field was clicked
          if (info.value) {
            setInputPrompt(`Refine "${info.value}"`);
          }
          // Removed the else block that set "Generate text for this field"
        } else {
          console.log("[SamAI Context Popup] No input info found in storage.");
        }
        if (result.pageBodyText) {
          setPageBodyText(result.pageBodyText as string);
        }
        if (result.pageOptimizedHtml) {
          setPageOptimizedHtml(result.pageOptimizedHtml as string);
        }

        // Load scrapeMode from searchSettingsStore
        const settings = await searchSettingsStore.getValue();
        setScrapeMode(settings.outputFormat);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();

    // No need to listen for storage changes for inputInfo, as per user feedback.
    // inputInfo is expected to be set before the popup opens.
    // No need to remove inputInfo from storage on unmount, as it's handled by background script.
  }, []);

  // Update scrapeMode in store when changed
  const handleScrapeModeChange = async (newMode: OutputFormat) => {
    setScrapeMode(newMode);
    const currentSettings = await searchSettingsStore.getValue();
    await searchSettingsStore.setValue({
      ...currentSettings,
      outputFormat: newMode,
    });
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

  const handlePageSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!pagePrompt.trim() || isPageLoading) return;

    // Only save pagePrompt to history if it's not "summarize"
    if (pagePrompt !== "summarize") {
      await addPageAssistantText(pagePrompt);
    }

    console.log(
      "[Page Assistant] Starting submission with prompt:",
      pagePrompt
    );
    setIsPageLoading(true);
    try {
      console.log("[Page Assistant] Generating response...");

      // Select content based on scrapeMode
      let contentToAnalyze =
        scrapeMode === "html" ? pageOptimizedHtml : pageBodyText;
      let userMessageContent = `Question about page: ${pagePrompt}`;

      if (scrapeMode === "html") {
        userMessageContent = `Question about page (Optimized HTML): ${pagePrompt}`;
      }

      const response = await generateFormResponse(
        `${pagePrompt}\n\nContent: ${contentToAnalyze}`
      );

      if (!response) {
        console.error("[Page Assistant] No response received");
        throw new Error("Failed to generate response");
      }
      console.log(
        "[Page Assistant] Response received, length:",
        response.length
      );

      console.log("[Page Assistant] Adding messages to chat...");
      
      // Check if we are on the same page as the previous context
      const previousContext = await pageContextStore.getValue();
      const isSamePage = previousContext.url === window.location.href;

      // Store page context for follow-up questions
      await pageContextStore.setValue({
        content: contentToAnalyze,
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
        format: scrapeMode,
      });
      const settings = await searchSettingsStore.getValue();

      // Only clear chat if we are NOT on the same page AND continuePreviousChat is false
      if (!settings.continuePreviousChat && !isSamePage) {
        console.log("[Page Assistant] Starting fresh chat (new page context)...");
        await chatStore.setValue({ messages: [] });
      } else if (isSamePage) {
        console.log("[Page Assistant] Continuing chat (same page context)...");
      }

      const userMessage = {
        role: "user" as const,
        content: userMessageContent,
        timestamp: new Date().toLocaleTimeString(),
      };

      const aiMessage = {
        role: "assistant" as const,
        content: response,
        timestamp: new Date().toLocaleTimeString(),
      };

      await addChatMessage(userMessage);
      await addChatMessage(aiMessage);
      console.log("[Page Assistant] Messages added to chat");

      console.log("[Page Assistant] Opening chat page...");
      await browser.tabs.create({
        url: "chat.html",
      });
      console.log("[Page Assistant] Chat page opened");

      setPagePrompt("");
      console.log("[Page Assistant] Closing popup...");
      window.close();
    } catch (error) {
      console.error("Error processing page:", error);
    } finally {
      setIsPageLoading(false);
    }
  };

  return (
    <div
      id="samai-context-popup-root"
      className="min-w-[320px] h-[340px] bg-[#1a1b2e] shadow-2xl p-5 text-gray-100 font-sans border border-[#2E2F3E] rounded-xl"
    >
      <div className="flex flex-col h-full space-y-5">
        <div
          className={`space-y-3 flex-none ${!inputInfo ? "opacity-60 grayscale" : ""}`}
        >
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-[#4f46e5] to-[#818cf8] rounded-full"></div>
            <h2 className="text-sm font-bold tracking-wide text-gray-200 uppercase">
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
                className="w-full px-3 py-2.5 bg-[#0D0E16] border border-[#2E2F3E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent placeholder-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm group-hover:border-[#4f46e5]/50"
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
                      <div className="absolute z-10 w-full bg-[#1E1F2E] border border-[#2E2F3E] rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl scrollbar-thin scrollbar-thumb-[#4f46e5] scrollbar-track-transparent">
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
              className={`w-full p-2.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white font-medium rounded-lg 
                      hover:opacity-90 focus:outline-none focus:ring-2 
                      focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                      transition-all duration-200 transform hover:scale-[0.98] shadow-lg shadow-[#4f46e5]/20
                      ${
                        isInputLoading || !inputInfo
                          ? "opacity-75 cursor-not-allowed shadow-none"
                          : ""
                      }`}
            >
              {isInputLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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

        <div className="w-full h-px bg-[#2E2F3E]"></div>

        <div className="relative flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-[#818cf8] to-[#a5b4fc] rounded-full"></div>
            <h2 className="text-sm font-bold tracking-wide text-gray-200 uppercase">
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
                className="w-full px-3 py-2.5 bg-[#0D0E16] border border-[#2E2F3E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#818cf8] focus:border-transparent placeholder-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm group-hover:border-[#818cf8]/50"
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
                      <div className="absolute z-10 w-full bg-[#1E1F2E] border border-[#2E2F3E] rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl scrollbar-thin scrollbar-thumb-[#818cf8] scrollbar-track-transparent">
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
                className={`flex-1 p-2.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white font-medium rounded-lg 
                          hover:opacity-90 focus:outline-none focus:ring-2 
                          focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                          transition-all duration-200 transform hover:scale-[0.98] shadow-lg shadow-[#4f46e5]/20
                          ${
                            isPageLoading ? "opacity-75 cursor-not-allowed shadow-none" : ""
                          }`}
              >
                {isPageLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
                className={`flex-1 p-2.5 bg-[#2E2F3E] text-gray-200 font-medium rounded-lg 
                          hover:bg-[#3E3F4E] hover:text-white focus:outline-none focus:ring-2 
                          focus:ring-[#818cf8] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                          transition-all duration-200 transform hover:scale-[0.98] border border-[#3E3F4E]`}
              >
                Summarize
              </button>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-[#2E2F3E] text-xs bg-[#0D0E16] p-0.5">
              <button
                type="button"
                onClick={(e: React.MouseEvent) => {
                  handleScrapeModeChange("text");
                  if (e.button === 2) {
                    window.close();
                  }
                }}
                className={`flex-1 px-3 py-1.5 text-center font-medium transition-all duration-200 rounded-md
                          ${
                            scrapeMode === "text"
                              ? "bg-[#2E2F3E] text-white shadow-sm"
                              : "text-gray-500 hover:text-gray-300"
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
                className={`flex-1 px-3 py-1.5 text-center font-medium transition-all duration-200 rounded-md
                          ${
                            scrapeMode === "html"
                              ? "bg-[#2E2F3E] text-white shadow-sm"
                              : "text-gray-500 hover:text-gray-300"
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
