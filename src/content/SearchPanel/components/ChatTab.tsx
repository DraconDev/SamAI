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
    <div className="flex flex-col h-full overflow-hidden border shadow-2xl bg-slate-900/95 border-slate-700/60 rounded-2xl backdrop-blur-xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center shadow-lg w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 shadow-emerald-500/30 ring-1 ring-emerald-400/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-400">
              Page Chat Assistant
            </h3>
            <p className="text-xs font-medium text-slate-400">Ask questions about this page</p>
          </div>
        </div>
        {isExtractingContent && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <div className="w-3 h-3 border-2 rounded-full border-emerald-400/30 border-t-emerald-400 animate-spin" />
            <span className="text-xs font-semibold text-emerald-400">Reading page...</span>
          </div>
        )}
      </div>

      {!isApiKeySet ? (
        <div className="flex items-center justify-center flex-1 p-8">
          <div className="max-w-sm text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 shadow-xl rounded-2xl bg-gradient-to-br from-amber-500 to-amber-400 shadow-amber-500/30 ring-1 ring-amber-400/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h3 className="mb-3 text-lg font-bold text-amber-400">
              API Key Required
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-slate-400">
              Configure your Gemini API key to start chatting with the page content.
            </p>
            <button
              onClick={onOpenApiKey}
              className="px-6 py-3 text-sm font-bold text-white transition-all duration-300 transform shadow-lg bg-gradient-to-r from-amber-500 to-amber-400 rounded-xl hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 ring-1 ring-amber-400/20"
            >
              Configure API Key
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Messages Container - Scrollable */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: '#475569 #1e293b'
          }}>
            {chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 shadow-xl rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 shadow-emerald-500/30 ring-1 ring-emerald-400/20">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <h4 className="mb-2 text-lg font-bold text-emerald-400">Chat Ready</h4>
                  <p className="text-sm font-medium text-slate-400">Ask questions about this page's content</p>
                </div>
              </div>
            ) : (
              chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  style={{
                    animation: `slideInFromBottom 0.3s ease-out ${index * 100}ms both`
                  }}
                >
                  <div
                    className={`max-w-[85%] group ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-400 text-white border border-emerald-400/30 shadow-lg shadow-emerald-500/20 ml-4"
                        : "bg-gradient-to-br from-slate-800/95 to-slate-700/95 border border-slate-600/60 text-slate-100 shadow-lg shadow-black/20 mr-4"
                    } rounded-2xl backdrop-blur-sm transition-all duration-200 hover:shadow-xl`}
                  >
                    {message.role === "user" ? (
                      <div className="p-4">
                        <div className="text-sm font-medium leading-relaxed">{message.content}</div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="text-sm leading-relaxed prose-sm prose prose-invert max-w-none">
                          <MarkdownRenderer content={message.content} />
                        </div>
                      </div>
                    )}
                    <div className={`px-4 pb-3 text-xs mt-1 flex items-center gap-1.5 ${
                      message.role === "user" ? "text-emerald-100/80" : "text-slate-400/80"
                    }`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                      <span className="font-medium">{message.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
            {(isChatLoading || isExtractingContent) && (
              <div className="flex justify-start" style={{ animation: 'slideInFromBottom 0.3s ease-out' }}>
                <div className="p-4 mr-4 border shadow-lg border-slate-600/60 bg-gradient-to-br from-slate-800/95 to-slate-700/95 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full shadow-sm bg-emerald-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full shadow-sm bg-emerald-400 animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 rounded-full shadow-sm bg-emerald-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                    <span className="text-xs font-semibold text-emerald-400">
                      {isExtractingContent ? "Reading page content..." : "AI is thinking..."}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input - Fixed at Bottom */}
          <div className="flex-shrink-0 p-4 border-t border-slate-700/50 bg-slate-800/95 backdrop-blur-md">
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              {/* Include Page Content Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="includePageContent"
                  checked={includePageContent}
                  onChange={(e) => onIncludePageContentChange(e.target.checked)}
                  className="w-4 h-4 transition-all duration-200 border-2 rounded cursor-pointer border-slate-600 bg-slate-700/50 text-emerald-500 focus:ring-emerald-500 focus:ring-2 focus:ring-offset-0 focus:ring-offset-slate-800 focus:border-emerald-500"
                />
                <label
                  htmlFor="includePageContent"
                  className="text-sm font-medium cursor-pointer select-none text-slate-300"
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
                    className="w-full h-12 px-4 pr-12 text-sm font-medium transition-all duration-200 border-2 outline-none text-slate-100 bg-slate-800/80 border-slate-600/60 rounded-xl placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isChatLoading || isExtractingContent}
                  />
                  {(isChatLoading || isExtractingContent) && (
                    <div className="absolute transform -translate-y-1/2 right-4 top-1/2">
                      <LoadingSpinner size="sm" color="success" />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isChatLoading || isExtractingContent || !chatInput.trim()}
                  className="h-12 px-6 font-bold text-white rounded-xl transition-all duration-200 min-w-[60px] flex items-center justify-center shadow-lg ring-1 ring-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-105 focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-800"
                  style={{
                    background: (isChatLoading || isExtractingContent || !chatInput.trim())
                      ? 'linear-gradient(to right, #6b7280, #9ca3af)'
                      : 'linear-gradient(to right, #10b981, #34d399)',
                    boxShadow: (isChatLoading || isExtractingContent || !chatInput.trim())
                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      : '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-400">Press Enter to send</span>
                <span className="px-2 py-1 font-semibold border rounded-full text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                  {outputFormat === "html" ? "📄 HTML mode" : "📝 Text mode"}
                </span>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};