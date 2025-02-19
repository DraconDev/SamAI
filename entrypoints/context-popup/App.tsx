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

  useEffect(() => {
    const loadInputInfo = async () => {
      try {
        const result = await browser.storage.local.get("inputInfo");
        console.log("Loaded from storage:", result);
        if (result.inputInfo) {
          setInputInfo(result.inputInfo);
          // Pre-fill input with value if available
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

      // Send the generated response through the background script using stored tab ID
      try {
        const result = await browser.runtime.sendMessage({
          target: 'content',
          data: {
            type: "setInputValue",
            value: response,
            tabId: inputInfo.tabId
          }
        });
        
        if (result.error) {
          console.error("Background script error:", result.error);
        } else {
          console.log("Successfully updated input value");
        }
      } catch (error) {
        console.error("Error sending message through background:", error);
      }
    }
    setInput("");
  };

  return (
    <div className="p-4 min-w-[300px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}
