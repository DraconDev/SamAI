import React, { useEffect, useRef } from 'react';
import { MarkdownRenderer } from '@/utils/markdown';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import type { ChatMessage } from '../types';
import type { OutputFormat } from '@/utils/page-content';

interface ChatTabProps {
  isApiKeySet: boolean;
  isExtractingContent: boolean;
  isChatLoading: boolean;
  chatMessages: ChatMessage[];
  chatInput: string;
  includePageContent: boolean;
  outputFormat: OutputFormat;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onIncludePageContentChange: (checked: boolean) => void;
  onOpenApiKey: () => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  isApiKeySet,
  isExtractingContent,
  isChatLoading,
  chatMessages,
  chatInput,
  includePageContent,
  outputFormat,
  messagesEndRef,
  onInputChange,
  onSubmit,
  onIncludePageContentChange,
  onOpenApiKey,
}) => {
  // Scroll to bottom when chat messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div
      className="flex flex-col overflow-hidden border shadow-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/95 rounded-2xl border-slate-700/50 backdrop-blur-xl"
      style={{
        height: 'calc(100vh - 280px)',
        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 25px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/40 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 shadow-lg rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 shadow-emerald-500/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-400">
              Page Chat Assistant
            </h3>
            <p className="text-xs text-slate-400">Ask questions about this page</p>
          </div>
        </div>
        {isExtractingContent && (
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <div className="w-3 h-3 border rounded-full border-emerald-400/30 border-t-emerald-400 animate-spin"></div>
            <span className="font-medium">Reading page...</span>
          </div>
        )}
      </div>

      {!isApiKeySet ? (
        <div className="flex items-center justify-center flex-1 p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mx-auto mb-3 shadow-xl w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-400 shadow-amber-500/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h3 className="mb-2 text-base font-bold text-amber-400">
              API Key Required
            </h3>
            <button
              onClick={onOpenApiKey}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-white font-bold rounded-xl text-xs hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Configure
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Messages Container - Scrollable */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
            {chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 shadow-xl rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 shadow-emerald-500/30">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <h4 className="mb-1 text-base font-bold text-emerald-400">Chat Ready</h4>
                  <p className="text-xs text-slate-400">Ask questions about this page</p>
                </div>
              </div>
            ) : (
              chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex animate-fade-in ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl shadow-xl backdrop-blur-sm border ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-400 text-white ml-4 border-emerald-400/30 shadow-emerald-500/20"
                        : "bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600/60 text-slate-100 mr-4 shadow-black/30"
                    }`}
                  >
                    {message.role === "user" ? (
                      <div className="text-sm font-medium leading-relaxed">{message.content}</div>
                    ) : (
                      <div className="text-sm leading-relaxed prose-sm prose prose-invert max-w-none">
                        <MarkdownRenderer content={message.content} />
                      </div>
                    )}
                    <div className={`text-xs mt-2 opacity-70 flex items-center gap-1 ${
                      message.role === "user" ? "text-emerald-100" : "text-slate-400"
                    }`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))
            )}
            {(isChatLoading || isExtractingContent) && (
              <div className="flex justify-start animate-fade-in">
                <div className="p-4 mr-4 border shadow-xl bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600/60 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full shadow-sm bg-emerald-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full shadow-sm bg-emerald-400 animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 rounded-full shadow-sm bg-emerald-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                    <span className="text-xs font-medium text-emerald-400">
                      {isExtractingContent ? "Reading page content..." : "AI is thinking..."}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input - Fixed at Bottom */}
          <div
            style={{
              flexShrink: 0,
              padding: "16px",
              borderTop: "1px solid rgba(51, 65, 85, 0.4)",
              background: "linear-gradient(to right, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95))",
              backdropFilter: "blur(24px)",
            }}
          >
            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Include Page Content Checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: "8px" }}>
                <input
                  type="checkbox"
                  id="includePageContent"
                  checked={includePageContent}
                  onChange={(e) => onIncludePageContentChange(e.target.checked)}
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    accentColor: '#10b981',
                  }}
                />
                <label
                  htmlFor="includePageContent"
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  Include page content in chat
                </label>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => onInputChange(e.target.value)}
                    placeholder={includePageContent ? "Ask about this page..." : "Ask anything..."}
                    className="sam-ai-chat-input"
                    style={{
                      width: "100%",
                      height: "48px",
                      padding: "0 16px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#f1f5f9",
                      backgroundColor: "rgba(30, 41, 59, 0.9)",
                      border: "2px solid rgba(71, 85, 105, 0.6)",
                      borderRadius: "12px",
                      outline: "none",
                      transition: "all 0.2s ease-in-out",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                    disabled={isChatLoading || isExtractingContent}
                  />
                  {(isChatLoading || isExtractingContent) && (
                    <div style={{
                      position: "absolute",
                      top: "50%",
                      right: "12px",
                      transform: "translateY(-50%)"
                    }}>
                      <LoadingSpinner size="sm" color="success" />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isChatLoading || isExtractingContent || !chatInput.trim()}
                  style={{
                    height: "48px",
                    padding: "0 24px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "white",
                    background: (isChatLoading || isExtractingContent || !chatInput.trim())
                      ? 'linear-gradient(to right, #6b7280, #9ca3af)'
                      : 'linear-gradient(to right, #10b981, #34d399)',
                    border: "2px solid rgba(16, 185, 129, 0.5)",
                    borderRadius: "12px",
                    cursor: (isChatLoading || isExtractingContent || !chatInput.trim()) ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "60px",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    opacity: (isChatLoading || isExtractingContent || !chatInput.trim()) ? 0.7 : 1,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "#64748b" }}>
                <span>Press Enter to send</span>
                <span style={{ fontWeight: 500, color: "#34d399" }}>
                  {outputFormat === "html" ? "📄 HTML" : "📝 Text"} mode
                </span>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};