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
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
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
                    className={`flex animate-fade-in group ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "user" ? (
                      <>
                        <div className="flex flex-col items-end gap-2 w-full max-w-[85%]">
                          <div
                            className="max-w-[85%] p-4 rounded-2xl shadow-xl backdrop-blur-sm border bg-gradient-to-br from-emerald-500/90 to-emerald-400/90 text-white border-emerald-400/40 shadow-emerald-500/25 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:from-emerald-500 hover:to-emerald-400 group-hover:scale-[1.02]"
                          >
                            <div className="text-sm font-medium leading-relaxed">{message.content}</div>
                            <div className="flex items-center justify-end gap-1 mt-2 text-xs opacity-70 text-emerald-100">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12,6 12,12 16,14" />
                              </svg>
                              {message.timestamp}
                            </div>
                          </div>
                          <div className="flex items-center justify-center rounded-full shadow-md w-7 h-7 bg-slate-600/50 ring-1 ring-slate-700/50">
                            <span className="text-xs font-bold text-slate-200">U</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-start gap-3 max-w-[85%]">
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mt-1 -ml-1 shadow-lg rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 shadow-emerald-500/30">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        </div>
                        <div
                          className="p-4 rounded-2xl shadow-xl backdrop-blur-sm border bg-gradient-to-br from-slate-800/95 to-slate-700/95 border-slate-600/70 text-slate-100 shadow-black/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:from-slate-800 hover:to-slate-700 group-hover:scale-[1.02] max-w-full"
                        >
                          <div className="text-sm leading-relaxed prose-sm prose prose-invert max-w-none">
                            <MarkdownRenderer content={message.content} />
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-xs opacity-70 text-slate-400">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12,6 12,12 16,14" />
                            </svg>
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
              ))
            )}
            {(isChatLoading || isExtractingContent) && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mt-1 -ml-1 shadow-lg rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 shadow-emerald-500/30">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mt-1 -ml-1 shadow-lg rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 shadow-emerald-500/30">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="max-w-full p-4 border shadow-xl rounded-2xl backdrop-blur-sm bg-gradient-to-br from-slate-800/95 to-slate-700/95 border-slate-600/70 shadow-black/40">
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
          <div className="flex-shrink-0 p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl rounded-b-2xl">
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              {/* Include Page Content Checkbox */}
              <div className="flex items-center gap-2 pt-1 pb-2">
                <input
                  type="checkbox"
                  id="includePageContent"
                  checked={includePageContent}
                  onChange={(e) => onIncludePageContentChange(e.target.checked)}
                  className="w-4 h-4 transition-all duration-200 border-2 rounded shadow-sm cursor-pointer border-slate-600/70 bg-slate-800/50 text-emerald-500 focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 accent-emerald-500 hover:shadow-md"
                />
                <label
                  htmlFor="includePageContent"
                  className="text-xs transition-colors cursor-pointer select-none text-slate-400 hover:text-slate-300"
                >
                  Include page content in chat
                </label>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => onInputChange(e.target.value)}
                    placeholder={includePageContent ? "Ask about this page..." : "Ask anything..."}
                    className="w-full h-12 px-4 py-2 text-sm font-medium transition-all duration-300 border-2 shadow-lg outline-none sam-ai-chat-input text-slate-100 placeholder-slate-500 bg-slate-800/90 border-slate-600/60 rounded-2xl hover:shadow-xl hover:border-slate-500/80 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 focus:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-md"
                    disabled={isChatLoading || isExtractingContent}
                  />
                  {(isChatLoading || isExtractingContent) && (
                    <div className="absolute -translate-y-1/2 top-1/2 right-4">
                      <LoadingSpinner size="sm" color="success" />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isChatLoading || isExtractingContent || !chatInput.trim()}
                  className={`h-12 flex items-center justify-center min-w-[60px] px-6 text-sm font-bold text-white rounded-2xl border-2 shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-md disabled:transform-none flex-shrink-0 ${
                    (isChatLoading || isExtractingContent || !chatInput.trim())
                      ? 'bg-gradient-to-r from-slate-600/80 to-slate-500/80 border-slate-500/50 shadow-slate-500/25'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400/60 shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:border-emerald-400 hover:shadow-xl'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                <span>Press Enter to send</span>
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
