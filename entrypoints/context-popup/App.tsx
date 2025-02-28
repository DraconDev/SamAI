import { generateFormResponse } from "@/utils/ai/gemini";
import React, { useState, useEffect } from "react";
import { chatStore } from "@/utils/store";

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
  const [pageContent, setPageContent] = useState("");
  const [inputInfo, setInputInfo] = useState<InputInfo | null>(null);
  const [isInputLoading, setIsInputLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    const loadPageContent = async () => {
      try {
        // Get current tab
        const [tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (!tab?.id) return;

        // Check if extension page
        const isExtensionPage =
          tab.url?.startsWith("chrome-extension://") ||
          tab.url?.startsWith("moz-extension://") ||
          tab.url?.startsWith("extension://");

        if (isExtensionPage) {
          setPageContent(
            "This is a browser extension page. Limited content is available for analysis."
          );
          return;
        }

        // Get page content
        const [result] = await browser.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.body.innerText,
        });

        if (result?.result) {
          setPageContent(result.result);
        } else {
          setPageContent("Unable to access page content.");
        }
      } catch (error) {
        console.error("Error loading page content:", error);
        setPageContent(
          "Unable to access page content due to browser restrictions."
        );
      } finally {
        setIsLoadingPage(false);
      }
    };

    loadPageContent();
  }, []);

  useEffect(() => {
    // const loadInputInfo = async () => {
    //   try {
    //     const result = await browser.storage.local.get("inputInfo");
    //     console.log("Loaded from storage:", result);
    //     if (result.inputInfo) {
    //       setInputInfo(result.inputInfo);
    //       // Pre-fill input with value if available
    //       if (result.inputInfo.value) {
    //         setInputPrompt(result.inputInfo.value);
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Error loading input info:", error);
    //   }
    // };

    // loadInputInfo();

    const handleUnload = () => {
      browser.storage.local.remove("inputInfo").catch(console.error);
    };

    window.addEventListener("unload", handleUnload);
    return () => {
      window.removeEventListener("unload", handleUnload);
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
      window.close();
    } catch (error) {
      console.error("Error processing input:", error);
    } finally {
      setIsInputLoading(false);
    }
  };

  const handlePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pagePrompt.trim() || isPageLoading) return;

    console.log(
      "[Page Assistant] Starting submission with prompt:",
      pagePrompt
    );
    setIsPageLoading(true);
    try {
      // Get current tab
      console.log("[Page Assistant] Getting current tab...");
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      console.log("[Page Assistant] Current tab:", tab);
      if (!tab.id) return;

      // Get page content
      console.log("[Page Assistant] Getting page content...");

      // Check if the current tab is an extension page
      const isExtensionPage =
        tab.url?.startsWith("chrome-extension://") ||
        tab.url?.startsWith("moz-extension://") ||
        tab.url?.startsWith("extension://");

      let pageContent = "";

      if (isExtensionPage) {
        console.log(
          "[Page Assistant] Detected extension page, using fallback content"
        );
        // Use already loaded page content
        pageContent = pageContent || "Unable to analyze this page.";
      } else {
        // Only try to execute script on non-extension pages
        try {
          const [result] = await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText,
          });

          if (!result?.result) {
            console.error("[Page Assistant] Failed to get page content");
            throw new Error("Failed to get page content");
          }
          console.log(
            "[Page Assistant] Got page content, length:",
            result.result.length
          );
          pageContent = result.result;
        } catch (error) {
          console.error("[Page Assistant] Error executing script:", error);
          pageContent =
            "Unable to access page content. This might be due to browser restrictions.";
        }
      }
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

      // Save chat messages
      console.log("[Page Assistant] Saving messages to store...");
      await chatStore.setValue({
        messages: [
          {
            role: "user" as const,
            content: `Question about page: ${pagePrompt}`,
            timestamp: new Date().toLocaleTimeString(),
          },
          {
            role: "assistant" as const,
            content: response,
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
      });
      console.log("[Page Assistant] Messages saved to store");

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
    <div className="min-w-[300px] min-h-[300px] bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16] shadow-xl p-6 text-gray-100 overflow-y-auto">
      <div className="flex flex-col h-full space-y-6">
        <div
          className={`space-y-3 flex-none ${!inputInfo ? "opacity-50" : ""}`}
        >
          <h2 className="font-semibold text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text">
            Input Assistant
          </h2>
          <form onSubmit={handleInputSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-3 placeholder-gray-500 transition-all duration-200 bg-[#1E1F2E] border border-[#2E2F3E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
              autoFocus={!!inputInfo}
              disabled={!inputInfo}
            />
            <button
              type="submit"
              disabled={isInputLoading || !inputInfo}
              className={`w-full p-2.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-lg 
                          hover:opacity-90 focus:outline-none focus:ring-2 
                          focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
                          transition-all duration-200 transform hover:scale-[0.98] 
                          ${
                            isInputLoading
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
              ) : (
                "Send"
              )}
            </button>
          </form>
          {!inputInfo && (
            <p className="text-sm italic text-gray-400">
              Click on an input field to enable this assistant
            </p>
          )}
        </div>

        <div className="relative flex-1">
          {isLoadingPage && (
            <div className="absolute inset-0 bg-[#1E1F2E]/80 flex items-center justify-center z-10 rounded-lg">
              <div className="flex items-center gap-3">
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
                <span className="text-sm text-[#818cf8]">
                  Loading page content...
                </span>
              </div>
            </div>
          )}
          <h2 className="font-semibold text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text mb-3">
            Page Assistant
          </h2>
          <form onSubmit={handlePageSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={pagePrompt}
              onChange={(e) => setPagePrompt(e.target.value)}
              placeholder="Type 'summarize' or ask a question about the page..."
              className="w-full p-3 placeholder-gray-500 transition-all duration-200 bg-[#1E1F2E] border border-[#2E2F3E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
              autoFocus={!inputInfo}
            />
            <button
              type="submit"
              disabled={isPageLoading}
              className={`w-full p-2.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-lg 
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
          </form>
        </div>
      </div>
    </div>
  );
}
