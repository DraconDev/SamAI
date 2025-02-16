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
    const params = new URLSearchParams(window.location.search);
    
    // If we have input info params, store them
    if (params.has('inputType')) {
      setInputInfo({
        value: params.get('value') || '',
        placeholder: params.get('placeholder') || '',
        inputType: params.get('inputType') || '',
        elementId: params.get('elementId') || '',
        elementName: params.get('elementName') || ''
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Input submitted:", input);
    if (inputInfo) {
      console.log("Input field info:", inputInfo);
    }
    // TODO: Handle the input
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
