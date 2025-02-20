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
  const [input, setInput] = useState("");
  const [inputInfo, setInputInfo] = useState<InputInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const loadInputInfo = async () => {
      try {
        const result = await browser.storage.local.get("inputInfo");
        console.log("Loaded from storage:", result);
        if (result.inputInfo) {
          setInputInfo(result.inputInfo);
          // Pre-fill input with value if available
          if (result.inputInfo.value) {
            setInput(result.inputInfo.value);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Input submitted:", input);
    console.log(inputInfo, "inputInfo");
    if (input.length < 3) {
      console.error("Input too short");
      return;
    }
    if (inputInfo) {
      console.log("Input field info:", inputInfo);
      const response = await generateFormResponse(input);
      if (!response) {
        console.error("Error generating response");
        return;
      }
      console.log("Generated response:", response);

      try {
        await browser.runtime.sendMessage({
          type: "setInputValue",
          value: response,
        });
        console.log("Message sent to background script");
      } catch (error) {
        console.error("Error sending message to background:", error);
      }
    }
    setInput("");
    setIsLoading(false);
  };

  const handlePageContent = async () => {
    setIsLoading(true);
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
      const response = await generateFormResponse(input || "Summarize this content concisely:", pageContent);

      // Show response in side panel
      await browser.tabs.sendMessage(tab.id, {
        type: "showSummary",
        summary: response,
      });

      window.close();
    } catch (error) {
      console.error("Error processing page content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (inputInfo) {
      // Handle input field response
      setIsLoading(true);
      console.log("Input field info:", inputInfo);
      const response = await generateFormResponse(input);
      if (!response) {
        console.error("Error generating response");
        return;
      }
      console.log("Generated response:", response);

      try {
        await browser.runtime.sendMessage({
          type: "setInputValue",
          value: response,
        });
        console.log("Message sent to background script");
      } catch (error) {
        console.error("Error sending message to background:", error);
      }
      setInput("");
      setIsLoading(false);
    } else {
      // Handle page content
      handlePageContent();
    }
  };

  return (
    <div className="min-w-[300px] min-h-[200px] bg-gradient-to-br from-white to-blue-50 shadow-lg">
      <div className="p-4">
        <h1 className="mb-4 text-lg font-semibold text-gray-700">
          {inputInfo ? "Input Assistant" : "Page Assistant"}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={inputInfo ? "Type your message..." : "Type 'summarize' or ask a question about the page..."}
            className="w-full p-3 placeholder-gray-400 transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[0.99] shadow-sm ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              "Send"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
