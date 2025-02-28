import React, { useState, useEffect, useRef } from "react";
import { chatStore, type ChatMessage } from "@/utils/store";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from store
  useEffect(() => {
    chatStore.getValue().then(store => {
      setMessages(store.messages);
    });
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString()
    };

    // Update local state and store
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    await chatStore.setValue({ messages: newMessages });

    setInput("");
    setIsLoading(true);

    try {
      const response = await browser.runtime.sendMessage({
        type: "generateGeminiResponse",
        prompt: input,
      });

      const aiMessage: ChatMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date().toLocaleTimeString()
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      await chatStore.setValue({ messages: updatedMessages });
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toLocaleTimeString()
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      await chatStore.setValue({ messages: updatedMessages });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16] text-gray-100">
      <header className="p-4 bg-[#1E1F2E] border-b border-[#2E2F3E]">
        <h1 className="text-xl font-bold text-center text-transparent bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text">
          Sam AI Chat
        </h1>
      </header>

      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="flex-1 p-4 space-y-4 overflow-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white"
                    : "bg-[#1E1F2E] border border-[#2E2F3E] text-gray-100"
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {message.content}
                </div>
                <div 
                  className={`text-xs mt-1 ${
                    message.role === "user" ? "text-indigo-200" : "text-gray-400"
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-[#1E1F2E] border border-[#2E2F3E] text-[#818cf8]">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#818cf8] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-[#818cf8] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-[#818cf8] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-[#1E1F2E] border-t border-[#2E2F3E]">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 bg-[#1a1b2e] border border-[#2E2F3E] rounded-lg text-gray-100 placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all duration-200"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-4 py-2.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-lg
                       font-medium hover:opacity-90 transform hover:scale-[0.98]
                       transition-all duration-200 focus:outline-none focus:ring-2 
                       focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1E1F2E]
                       disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
