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
          value: response
        });
        console.log("Message sent to background script");
      } catch (error) {
        console.error("Error sending message to background:", error);
      }
    }
    setInput("");
    setIsLoading(false);
  };

  return (
    <div className="min-w-[300px] min-h-[200px] bg-gradient-to-br from-white to-blue-50 shadow-lg">
      <div className="p-4">
        <h1 className="text-lg font-semibold text-gray-700 mb-4">AI Assistant</h1>
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
