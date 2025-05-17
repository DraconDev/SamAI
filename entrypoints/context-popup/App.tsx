import { generateFormResponse } from "@/utils/ai/gemini";
import React, { useState, useEffect } from "react";
import { addChatMessage, chatStore, searchSettingsStore } from "@/utils/store";
import { extractPageContent } from "@/utils/page-content";

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
  const [scrapeUrl, setScrapeUrl] = useState("");

  useEffect(() => {
    // Load stored data from local storage
    const loadStoredData = async () => {
      try {
        const result = await browser.storage.local.get([
          "inputInfo",
          "pageContent",
        ]);
        if (result.inputInfo) {
          setInputInfo(result.inputInfo as InputInfo);
        }
        if (result.pageContent) {
          setPageContent(result.pageContent as string);
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
      const response = await generateFormResponse(
        `${pagePrompt}\n\nContent: ${pageContent}`
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
        content: `Question about page: ${pagePrompt}`,
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

  const handleScrapeBody = async () => {
    if (!scrapeUrl) return;
    try {
      const response = await fetch(scrapeUrl);
      const text = await response.text();
      const bodyContent = new DOMParser()
        .parseFromString(text, "text/html")
        .querySelector("body")?.textContent;
      setPagePrompt(`Summarize this content: ${bodyContent}`);
    } catch (error) {
      console.error("Scraping failed:", error);
    }
  };

  const handleScrapeHTML = async () => {
    if (!scrapeUrl) return;
    try {
      const response = await fetch(scrapeUrl);
      const html = await response.text();
      setPagePrompt(`Analyze this HTML: ${html.substring(0, 1000)}...`);
    } catch (error) {
      console.error("Scraping failed:", error);
    }
  };

  return (
    <div className="min-w-[300px] min-h-[950px] bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16] shadow-xl p-6 text-gray-100 overflow-y-auto font-sans">
      <div className="flex flex-col h-full space-y-8">
        <div
          className={`space-y-4 flex-none ${!inputInfo ? "opacity-60" : ""}`}
        >
          <h2 className="text-lg font-bold text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text">
            Input Assistant
          </h2>
          <form onSubmit={handleInputSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-3 bg-[#1E1F2E] border border-[#2E2F3E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent placeholder-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus={!!inputInfo}
              disabled={!inputInfo || isInputLoading}
            />
            <button
              type="submit"
              disabled={isInputLoading || !inputInfo}
              className={`w-full p-3 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white font-semibold rounded-md
                          hover:opacity-95 focus:outline-none focus:ring-2
                          focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                          transition-all duration-200 ease-in-out
                          ${
                            isInputLoading || !inputInfo
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }`}
            >
              {isInputLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5">
                    <svg viewBox="0 0 50 50">
                      <path
                        d="M25,25 m-20,0 a20,20 0 1,1 40,0 a20,20 0 1,1 -40,0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
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
          </form>
          {!inputInfo && (
            <p className="text-sm italic text-gray-400">
              Click on an input field to enable this assistant.
            </p>
          )}
        </div>

        <div className="relative flex-1 space-y-4">
          <h2 className="text-lg font-bold text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text">
            Page Assistant
          </h2>
          <form onSubmit={handlePageSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={pagePrompt}
              onChange={(e) => setPagePrompt(e.target.value)}
              placeholder="Type 'summarize' or ask a question about the page..."
              className="w-full p-3 bg-[#1E1F2E] border border-[#2E2F3E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent placeholder-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus={!inputInfo}
              disabled={isPageLoading}
            />
            <button
              type="submit"
              disabled={isPageLoading}
              className={`w-full p-3 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white font-semibold rounded-md
                        hover:opacity-95 focus:outline-none focus:ring-2
                        focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                        transition-all duration-200 ease-in-out
                        ${
                          isPageLoading ? "opacity-60 cursor-not-allowed" : ""
                        }`}
            >
              {isPageLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5">
                    <svg viewBox="0 0 50 50">
                      <path
                        d="M25,25 m-20,0 a20,20 0 1,1 40,0 a20,20 0 1,1 -40,0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
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
              className={`w-full p-3 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white font-semibold rounded-md
                        hover:opacity-95 focus:outline-none focus:ring-2
                        focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                        transition-all duration-200 ease-in-out mt-2`}
            >
              Summarize
            </button>
          </form>
        </div>

        <div className="mt-2 space-y-4">
          <h2 className="text-base font-bold text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text">
            Scrape Assistant
          </h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              placeholder="Enter URL to scrape"
              className="w-full p-3 bg-[#1E1F2E] border border-[#2E2F3E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent placeholder-gray-500 transition-colors duration-200"
            />
            <div className="flex gap-4">
              <button
                onClick={handleScrapeBody}
                className={`w-full p-3 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white font-semibold rounded-md
                          hover:opacity-95 focus:outline-none focus:ring-2
                          focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                          transition-all duration-200 ease-in-out`}
              >
                Scrape Body
              </button>
              <button
                onClick={handleScrapeHTML}
                className={`w-full p-3 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white font-semibold rounded-md
                          hover:opacity-95 focus:outline-none focus:ring-2
                          focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                          transition-all duration-200 ease-in-out`}
              >
                Scrape HTML
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
