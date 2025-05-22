import { generateFormResponse } from "@/utils/ai/gemini";
import React, { useState, useEffect } from "react";
import { addChatMessage, chatStore, searchSettingsStore } from "@/utils/store";
import { extractPageContent, optimizeHtmlContent } from "@/utils/page-content";

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
  const [pageContent, setPageContent] = useState("");
  const [isInputLoading, setIsInputLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [scrapeMode, setScrapeMode] = useState<"bodyText" | "optimizedHtml">(
    "bodyText"
  );

  useEffect(() => {
    // Load stored data from local storage
    const loadStoredData = async () => {
      try {
        const result = await browser.storage.local.get([
          "inputInfo",
          "pageContent",
          "scrapeMode", // Add scrapeMode here
        ]);
        if (result.inputInfo) {
          setInputInfo(result.inputInfo as InputInfo);
        }
        if (result.pageContent) {
          setPageContent(result.pageContent as string);
        }
        if (result.scrapeMode) {
          // Load scrapeMode
          setScrapeMode(result.scrapeMode as "bodyText" | "optimizedHtml");
        }
      } catch (error) {
        console.error("Error loading stored data:", error);
      }
    };

    loadStoredData();
  }, []);

  useEffect(() => {
    // Clean up the input info when component unmounts or popup closes
    return () => {
      browser.storage.local.remove("inputInfo").catch(console.error);
    };
  }, []);

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isInputLoading || !inputInfo) return;

    setIsInputLoading(true);
    try {
      const response = await generateFormResponse(inputPrompt);
      if (!response) {
        console.error("Error generating response");
        return;
      }

      await browser.runtime.sendMessage({
        type: "setInputValue",
        value: response,
      });

      setInputPrompt("");
      // Explicitly clear the input info from storage after submission
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

    console.log(
      "[Page Assistant] Starting submission with prompt:",
      pagePrompt
    );
    setIsPageLoading(true);
    try {
      console.log("[Page Assistant] Generating response...");

      let contentToAnalyze = pageContent; // Default to body text
      let userMessageContent = `Question about page: ${pagePrompt}`;

      if (scrapeMode === "optimizedHtml") {
        const tabs = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tabs.length === 0 || !tabs[0].url) {
          console.error(
            "[Page Assistant] No active tab URL found for HTML scraping."
          );
          throw new Error("No active tab URL found.");
        }
        const currentTabUrl = tabs[0].url;
        console.log(`[Page Assistant] Fetching HTML from: ${currentTabUrl}`);
        const response = await fetch(currentTabUrl);
        const htmlContent = await response.text();
        contentToAnalyze = optimizeHtmlContent(htmlContent); // Apply optimization
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

      // Check chat continuation setting and add messages
      console.log("[Page Assistant] Adding messages to chat...");
      const settings = await searchSettingsStore.getValue();

      if (!settings.continuePreviousChat) {
        console.log("[Page Assistant] Starting fresh chat...");
        await chatStore.setValue({ messages: [] });
      }

      const userMessage = {
        role: "user" as const,
        content: userMessageContent, // Use the updated user message content
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

      // Open chat in new tab
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
      className="min-w-[300px] min-h-[450px] bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16] shadow-xl p-4 text-gray-100 font-sans"
    >
      <div className="flex flex-col h-full space-y-4">
        <div
          className={`space-y-2 flex-none ${!inputInfo ? "opacity-60" : ""}`}
        >
          <h2 className="text-lg font-bold text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text">
            Input Assistant
          </h2>
          <form onSubmit={handleInputSubmit} className="flex flex-col gap-2">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-2 bg-[#1E1F2E] border border-[#2E2F3E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent placeholder-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              autoFocus={!!inputInfo}
              disabled={!inputInfo || isInputLoading}
            />
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
                "Click on an input field to enable this assistant"
              )}
            </button>
          </form>
        </div>

        <div className="relative flex-1 space-y-2">
          <h2 className="text-lg font-bold text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text">
            Page Assistant
          </h2>
          <form onSubmit={handlePageSubmit} className="flex flex-col gap-2">
            <input
              type="text"
              value={pagePrompt}
              onChange={(e) => setPagePrompt(e.target.value)}
              placeholder="Ask a question about the page"
              className="w-full p-2 bg-[#1E1F2E] border border-[#2E2F3E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent placeholder-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              autoFocus={!inputInfo}
              disabled={isPageLoading}
            />
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="bodyText"
                  checked={scrapeMode === "bodyText"}
                  onChange={async () => {
                    setScrapeMode("bodyText");
                    await searchSettingsStore.setValue((prev) => ({
                      ...prev,
                      outputFormat: "text",
                    }));
                  }}
                  className="form-radio h-4 w-4 text-[#4f46e5] transition-colors duration-200 focus:ring-[#4f46e5]"
                />
                <span className="ml-2 text-gray-300">Body Text</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="optimizedHtml"
                  checked={scrapeMode === "optimizedHtml"}
                  onChange={async () => {
                    setScrapeMode("optimizedHtml");
                    await searchSettingsStore.setValue((prev) => ({
                      ...prev,
                      outputFormat: "html",
                    }));
                  }}
                  className="form-radio h-4 w-4 text-[#4f46e5] transition-colors duration-200 focus:ring-[#4f46e5]"
                />
                <span className="ml-2 text-gray-300">Optimized HTML</span>
              </label>
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
                onClick={async () => { // Make this async
                  setPagePrompt("summarize");
                  await handlePageSubmit(); // Await the submission
                }}
                className={`flex-1 p-2.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-lg 
                          hover:opacity-90 focus:outline-none focus:ring-2 
                          focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                          transition-all duration-200 transform hover:scale-[0.98]`}
              >
                Summarize
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
