import { generateFormResponse } from "@/utils/ai/gemini";
import React, { useState, useEffect } from "react";

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
  const [isInputLoading, setIsInputLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  useEffect(() => {
    const loadInputInfo = async () => {
      try {
        const result = await browser.storage.local.get("inputInfo");
        console.log("Loaded from storage:", result);
        if (result.inputInfo) {
          setInputInfo(result.inputInfo);
          // Pre-fill input with value if available
          if (result.inputInfo.value) {
            setInputPrompt(result.inputInfo.value);
          }
        }
      } catch (error) {
        console.error("Error loading input info:", error);
      }
    };

    loadInputInfo();

    // Clear storage when popup closes
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

    setIsPageLoading(true);
    try {
      // Get current tab
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      // Get page content
      const [result] = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText,
      });

      const pageContent = result.result;
      const response = await generateFormResponse(
        `${pagePrompt}\n\nContent: ${pageContent}`
      );

      // Show response in side panel
      await browser.tabs.sendMessage(tab.id, {
        type: "showSummary",
        summary: response,
      });

      setPagePrompt("");
      window.close();
    } catch (error) {
      console.error("Error processing page:", error);
    } finally {
      setIsPageLoading(false);
    }
  };

  return (
    <div className="min-w-[300px] min-h-[200px] bg-gradient-to-br from-white to-blue-50 shadow-lg p-4">
      <div className="space-y-4">
        {inputInfo && (
          <>
            <h2 className="font-medium text-gray-700">Input Assistant</h2>
            <form onSubmit={handleInputSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-3 placeholder-gray-400 transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                autoFocus={!!inputInfo}
              />
              <button
                type="submit"
                disabled={isInputLoading}
                className={`w-full p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg 
                          hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 
                          focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 
                          transform hover:scale-[0.99] shadow-sm
                          ${isInputLoading ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                {isInputLoading ? "Processing..." : "Send"}
              </button>
            </form>
          </>
        )}

        <div className={inputInfo ? "mt-6" : ""}>
          <h2 className="font-medium text-gray-700">Page Assistant</h2>
          <form onSubmit={handlePageSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={pagePrompt}
              onChange={(e) => setPagePrompt(e.target.value)}
              placeholder="Type 'summarize' or ask a question about the page..."
              className="w-full p-3 placeholder-gray-400 transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              autoFocus={!inputInfo}
            />
            <button
              type="submit"
              disabled={isPageLoading}
              className={`w-full p-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg 
                        hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 
                        focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 
                        transform hover:scale-[0.99] shadow-sm
                        ${isPageLoading ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              {isPageLoading ? "Processing..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
