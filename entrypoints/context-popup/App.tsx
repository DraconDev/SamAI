import React, { useState, useEffect } from "react";

export default function App() {
  const [input, setInput] = useState("");
  const [isInputElement, setIsInputElement] = useState(false);

  useEffect(() => {
    // Check if we have any URL parameters, indicating an input element was clicked
    const params = new URLSearchParams(window.location.search);
    setIsInputElement(params.has("inputType"));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Input submitted:", input);
    if (isInputElement) {
      console.log("Clicked on an input element");
    } else {
      console.log("Clicked on a regular element");
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
