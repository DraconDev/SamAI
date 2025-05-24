/// <reference types="wxt/browser" />
import { generateFormResponse } from "@/utils/ai/gemini";
import React, { useState, useEffect } from "react";
import {
  addChatMessage,
  chatStore,
  searchSettingsStore,
  lastUsedTextsStore,
  addInputText,
  addPageAssistantText,
} from "@/utils/store";
import { OutputFormat } from "@/utils/page-content"; // Import OutputFormat

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
          } else if (info.placeholder) {
            setInputPrompt(`Generate text for "${info.placeholder}"`);
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
      const settings = await searchSettingsStore.getValue();

      if (!settings.continuePreviousChat) {
        console.log("[Page Assistant] Starting fresh chat...");
        await chatStore.setValue({ messages: [] });
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
      className="min-w-[300px] min-h-[650px] bg-gradient-to-br from-[#1a1b2e] to-[#10111a] shadow-lg p-4 text-gray-100 font-sans"
    >
      <div className="flex flex-col h-full space-y-4">
        <div
          className={`space-y-2 flex-none ${!inputInfo ? "opacity-60" : ""}`}
        >
          <h2 className="text-lg font-bold text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text">
            Input Assistant
          </h2>
          <form onSubmit={handleInputSubmit} className="flex flex-col gap-2">
            <div className="relative">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onFocus={() => setShowInputHistory(true)}
                onBlur={() => setTimeout(() => setShowInputHistory(false), 100)} // Delay to allow click on history item
                placeholder="Type your message..."
                className="w-full p-2 bg-[#1E1F2E] border border-[#2E2F3E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent placeholder-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                      <div className="absolute z-10 w-full bg-[#1E1F2E] border border-[#2E2F3E] rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {filteredInputTexts.map((text, index) => (
                          <div
                            key={index}
                            className="p-2 cursor-pointer hover:bg-[#2E2F3E] text-sm"
                            onClick={() => {
                              setInputPrompt(text);
                              setShowInputHistory(false);
                              handleInputSubmit(); // Trigger send
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
              className={`w-full p-2.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-lg 
                      hover:opacity-90 focus:outline-none focus:ring-2 
                      focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                      transition-all duration-200 transform hover:scale-[0.98] 
                      ${
                        isInputLoading || !inputInfo
                          ? "opacity-75 cursor-not-allowed"
                          : ""
                      }`}
            >
              {isInputLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4">
                    <svg viewBox="0 0 50 50">
                      <path
                        d="M25,25 m-20,0 a20,20 0 1,1 40,0 a20,20 0 1,1 -40,0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="animate-[dash_1.5s_ease-in-out_infinite]"
                        style={{
                          strokeDasharray: "90,150",
                          strokeDashoffset: "-35",
                          animation:
                            "dash 1.5s ease-in-out infinite, rotate 2s linear infinite",
                        }}
                      />
                    </svg>
                  </div>
                  <span>Processing...</span>
                </div>
              ) : inputInfo ? (
                "Send"
              ) : (
                "Select an input field" // Changed text
              )}
            </button>
          </form>
        </div>

        <div className="relative flex-1 space-y-2">
          <h2 className="text-lg font-bold text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text">
            Page Assistant
          </h2>
          <form onSubmit={handlePageSubmit} className="flex flex-col gap-2">
            <div className="relative">
              <input
                type="text"
                value={pagePrompt}
                onChange={(e) => setPagePrompt(e.target.value)}
                onFocus={() => setShowPageHistory(true)}
                onBlur={() => setTimeout(() => setShowPageHistory(false), 100)} // Delay to allow click on history item
                placeholder="Ask a question about the page"
                className="w-full p-2 bg-[#1E1F2E] border border-[#2E2F3E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent placeholder-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                      <div className="absolute z-10 w-full bg-[#1E1F2E] border border-[#2E2F3E] rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {filteredPageAssistantTexts.map((text, index) => (
                          <div
                            key={index}
                            className="p-2 cursor-pointer hover:bg-[#2E2F3E] text-sm"
                            onClick={() => {
                              setPagePrompt(text);
                              setShowPageHistory(false);
                              handlePageSubmit(); // Trigger send
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
                className={`flex-1 p-2.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-lg 
                          hover:opacity-90 focus:outline-none focus:ring-2 
                          focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                          transition-all duration-200 transform hover:scale-[0.98]
                          ${
                            isPageLoading ? "opacity-75 cursor-not-allowed" : ""
                          }`}
              >
                {isPageLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4">
                      <svg viewBox="0 0 50 50">
                        <path
                          d="M25,25 m-20,0 a20,20 0 1,1 40,0 a20,20 0 1,1 -40,0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          className="animate-[dash_1.5s_ease-in-out_infinite]"
                          style={{
                            strokeDasharray: "90,150",
                            strokeDashoffset: "-35",
                            animation:
                              "dash 1.5s ease-in-out infinite, rotate 2s linear infinite",
                          }}
                        />
                      </svg>
                    </div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Send"
                )}
              </button>
              <button
                onClick={() => {
                  setPagePrompt("summarize");
                  handlePageSubmit();
                }}
                className={`flex-1 p-2.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-lg 
                          hover:opacity-90 focus:outline-none focus:ring-2 
                          focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                          transition-all duration-200 transform hover:scale-[0.98]`}
              >
                Summarize
              </button>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-[#2E2F3E] text-xs">
              <button
                type="button"
                onClick={(e: React.MouseEvent) => {
                  handleScrapeModeChange("text");
                  if (e.button === 2) {
                    window.close();
                  }
                }}
                className={`flex-1 px-3 py-1.5 text-center font-medium transition-all duration-200
                          ${
                            scrapeMode === "text"
                              ? "bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white ring-2 ring-[#818cf8] ring-offset-1 ring-offset-[#1a1b2e]"
                              : "bg-[#1E1F2E] text-gray-400 hover:bg-[#2E2F3E] hover:text-gray-200"
                          }`}
              >
                Body Text
              </button>
              <button
                type="button"
                onClick={(e: React.MouseEvent) => {
                  handleScrapeModeChange("html");
                  if (e.button === 2) {
                    window.close();
                  }
                }}
                className={`flex-1 px-3 py-1.5 text-center font-medium transition-all duration-200
                          ${
                            scrapeMode === "html"
                              ? "bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white ring-2 ring-[#818cf8] ring-offset-1 ring-offset-[#1a1b2e]"
                              : "bg-[#1E1F2E] text-gray-400 hover:bg-[#2E2F3E] hover:text-gray-200"
                          }`}
              >
                Optimized HTML
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
