import React, { useState, useEffect, useRef } from "react";
import { chatStore, type ChatMessage, addChatMessage, searchSettingsStore } from "@/utils/store";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages and settings from store
  useEffect(() => {
    const loadData = async () => {
      const [chatData, settings] = await Promise.all([
        chatStore.getValue(),
        searchSettingsStore.getValue()
      ]);

      if (settings.continuePreviousChat) {
        // Keep only the last 2 messages
        const lastTwoMessages = chatData.messages.slice(-2);
        setMessages(lastTwoMessages);
        await chatStore.setValue({ messages: lastTwoMessages }); // Update stored messages
      } else {
        setMessages([]); // Start with empty chat
        await chatStore.setValue({ messages: [] }); // Clear stored messages
      }
    };

    loadData();
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
      timestamp: new Date().toLocaleTimeString(),
    };

    // Add user message and update local state
    const newMessages = await addChatMessage(userMessage);
    setMessages(newMessages);

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
        timestamp: new Date().toLocaleTimeString(),
      };

      // Add AI message and update local state
      const updatedMessages = await addChatMessage(aiMessage);
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      };
      // Add error message and update local state
      const updatedMessages = await addChatMessage(errorMessage);
      setMessages(updatedMessages);
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
        <div className="flex-1 p-4 space-y-4 overflow-auto scrollbar-thin scrollbar-thumb-[#2E2F3E] scrollbar-track-[#1a1b2e] hover:scrollbar-thumb-[#4f46e5]">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg shadow-lg ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white"
                    : "bg-[#1E1F2E] border border-[#2E2F3E] text-gray-100"
                }`}
              >
                <div className={`leading-relaxed whitespace-pre-wrap ${
                  message.role === "user" && message.content.startsWith("Question about page:") 
                  ? "flex items-center gap-2" 
                  : ""
                }`}>
                  {message.role === "user" && message.content.startsWith("Question about page:") && (
                    <svg className="w-4 h-4 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {message.role === "user" && message.content.startsWith("Question about page:") 
                    ? message.content.replace("Question about page:", "").trim()
                    : message.content}
                </div>
                <div
                  className={`text-xs message-timestamp ${
                    message.role === "user"
                      ? "text-indigo-200"
                      : "text-[#818cf8]"
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-[#1E1F2E] border border-[#2E2F3E] shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div
                      className="w-1.5 h-1.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] rounded-full animate-pulse"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] rounded-full animate-pulse"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] rounded-full animate-pulse"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-sm text-[#818cf8]">
                    AI is thinking...
                  </span>
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
