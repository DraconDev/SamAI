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
  const [inputPrompt, setInputPrompt] = useState("");
  const [pagePrompt, setPagePrompt] = useState("");
  const [inputInfo, setInputInfo] = useState<InputInfo | null>(null);
  const [pageContent, setPageContent] = useState("");
  const [isInputLoading, setIsInputLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [scrapeMode, setScrapeMode] = useState<OutputFormat>("text"); // Default to "text"

  // Load initial settings and page content
  useEffect(() => {
    const loadInitialData = async () => {
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

        // Load scrapeMode from searchSettingsStore
        const settings = await searchSettingsStore.getValue();
        setScrapeMode(settings.outputFormat);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();

    // Listen for messages from the content script (e.g., page content response)
    const messageListener = (
      message: any,
      sender: browser.runtime.MessageSender
    ) => {
      if (message.type === "pageContentResponse" && message.content) {
        console.log(
          "[Page Assistant] Received pageContentResponse:",
          message.content.length,
          "bytes"
        );
        setPageContent(message.content);
        setIsPageLoading(false); // Stop loading after content is received
      } else if (message.type === "pageContentResponse" && message.error) {
        console.error(
          "[Page Assistant] Error in pageContentResponse:",
          message.error
        );
        setIsPageLoading(false);
      }
    };

    browser.runtime.onMessage.addListener(messageListener);

    return () => {
      browser.storage.local.remove("inputInfo").catch(console.error);
      browser.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  // Update scrapeMode in store when changed
  const handleScrapeModeChange = async (
    newMode: "text" | "html"
  ) => {
    setScrapeMode(newMode);
    await searchSettingsStore.setValue({ outputFormat: newMode });
  };

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

      if (scrapeMode === "html") {
        // Request optimized HTML from the content script
        console.log("[Page Assistant] Requesting optimized HTML from content script...");
        // Send message to background script, which will forward to content script
        await browser.runtime.sendMessage({ type: "getPageContent" });

        // The content will be set by the message listener in useEffect
        // We need to wait for it before proceeding with generateFormResponse
        // This is a simplified approach; a more robust solution might use a promise/callback
        // For now, we assume pageContent will be updated by the listener before the next step
        // A better approach would be to move the AI call into the message listener or use a state to track content readiness.
        // For this fix, we'll rely on the pageContent state being updated.
        // The prompt will be sent with the *currently available* pageContent.
        // If the content hasn't arrived yet, it will use the old content.
        // This needs to be fixed.

        // FIX: Instead of relying on state update, directly get content here after message.
        // The content script sends back the content directly.
        // We need to await the response from the content script.
        const responseFromContent = await browser.tabs.sendMessage(
          (await browser.tabs.query({ active: true, currentWindow: true }))[0].id!,
          { type: "getPageContent" }
        );

        if (responseFromContent && responseFromContent.content) {
          contentToAnalyze = responseFromContent.content;
          userMessageContent = `Question about page (Optimized HTML): ${pagePrompt}`;
        } else if (responseFromContent && responseFromContent.error) {
          console.error("[Page Assistant] Error getting content from content script:", responseFromContent.error);
          throw new Error(`Failed to get page content: ${responseFromContent.error}`);
        } else {
          console.error("[Page Assistant] No content received from content script.");
          throw new Error("No content received from content script.");
        }
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
                  onChange={() => setScrapeMode("bodyText")}
                  className="form-radio h-4 w-4 text-[#4f46e5] transition-colors duration-200 focus:ring-[#4f46e5]"
                />
                <span className="ml-2 text-gray-300">Body Text</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="optimizedHtml"
                  checked={scrapeMode === "optimizedHtml"}
                  onChange={() => setScrapeMode("optimizedHtml")}
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
          </form>
        </div>
      </div>
    </div>
  );
}
