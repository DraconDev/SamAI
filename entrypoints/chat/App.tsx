import React, { useState, useEffect, useRef } from "react";
import {
  chatStore,
  type ChatMessage,
  addChatMessage,
  searchSettingsStore,
} from "@/utils/store";
import { MarkdownRenderer } from "@/utils/markdown";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages and settings from store
  useEffect(() => {
    const loadData = async () => {
      const [chatData, settings] = await Promise.all([
        chatStore.getValue(),
        searchSettingsStore.getValue(),
      ]);

      if (settings.continuePreviousChat) {
        setMessages(chatData.messages);
      } else {
        // Keep only the last 2 messages
        const lastTwoMessages = chatData.messages.slice(-2);
        setMessages(lastTwoMessages);
        await chatStore.setValue({ messages: lastTwoMessages }); // Update stored messages
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
    <div className="h-screen bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16] text-gray-100 antialiased">
      <header className="py-6 bg-gradient-to-b from-[#1E1F2E] to-[#1a1b2e] border-b border-[#2E2F3E]/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-center text-transparent bg-gradient-to-r from-[#818cf8] via-[#6366f1] to-[#4f46e5] bg-clip-text drop-shadow-lg">
          Sam AI Chat
        </h1>
      </header>

      <div className="flex flex-col h-[calc(100vh-80px)]">
        <div className="flex-1 p-6 space-y-6 overflow-auto scrollbar-thin scrollbar-thumb-[#2E2F3E] scrollbar-track-[#1a1b2e] hover:scrollbar-thumb-[#4f46e5]">
          <div className="w-full max-w-5xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                <div
                  className={`max-w-[80%] p-5 rounded-xl shadow-xl ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white shadow-indigo-500/20"
                      : "bg-gradient-to-br from-[#1E1F2E] to-[#1a1b2e] border border-[#2E2F3E]/50 text-gray-100 shadow-black/20"
                  }`}
                >
                  <div
                    className={`leading-relaxed whitespace-pre-wrap text-[15px] ${
                      message.role === "user" &&
                      message.content.startsWith("Question about page:")
                        ? "flex items-center gap-2"
                        : ""
                    }`}
                  >
                    {message.role === "user" &&
                      message.content.startsWith("Question about page:") && (
                        <svg
                          className="w-4 h-4 opacity-80"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      )}
                    {message.role === "user" &&
                    message.content.startsWith("Question about page:")
                      ? message.content
                          .replace("Question about page:", "")
                          .trim()
                      : message.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-5 rounded-xl bg-gradient-to-br from-[#1E1F2E] to-[#1a1b2e] border border-[#2E2F3E]/50 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] rounded-full animate-ping opacity-20"></div>
                      <div className="relative flex space-x-1">
                        <div
                          className="w-2 h-2 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-[#818cf8]">
                      AI is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} className="h-4" />
        </div>

        <div className="p-6 bg-gradient-to-t from-[#1E1F2E] to-[#1a1b2e] border-t border-[#2E2F3E]/50 backdrop-blur-sm">
          <form
            onSubmit={handleSendMessage}
            className="flex max-w-4xl mx-auto space-x-4"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-5 text-[15px] bg-[#1a1b2e]/50 border border-[#2E2F3E]/50 rounded-xl text-gray-100 placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] 
                       transition-all duration-200 shadow-lg backdrop-blur-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-8 py-5 bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-xl text-[15px]
                       font-medium hover:opacity-90 transform hover:scale-[0.98] shadow-lg
                       transition-all duration-200 focus:outline-none focus:ring-2 
                       focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#1E1F2E]
                       disabled:opacity-50 disabled:cursor-not-allowed group relative
                       hover:shadow-indigo-500/25`}
            >
              <span className="flex items-center gap-2">
                Send
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform transform translate-x-0 group-hover:translate-x-1"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
