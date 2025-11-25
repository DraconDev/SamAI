import { LoadingSpinner } from "@/src/components/ui/LoadingSpinner";
import { MarkdownRenderer } from "@/utils/markdown";
import type { OutputFormat } from "@/utils/page-content";
import React, { useEffect } from "react";
import type { ChatMessage } from "../types";

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
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const renderMessages = () => {
    if (chatMessages.length === 0) {
      return (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          <div>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
              }}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#34d399"
                strokeWidth="2.2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                marginBottom: "0.35rem",
                color: "#e2e8f0",
              }}
            >
              Chat is ready
            </div>
            <p style={{ fontSize: "0.85rem" }}>
              Ask anything about the page and SamAI will respond with
              context-aware answers.
            </p>
          </div>
        </div>
      );
    }

    return chatMessages.map((message, index) => {
      const isUser = message.role === "user";
      return (
        <div
          key={`${message.timestamp}-${index}`}
          style={{
            display: "flex",
            justifyContent: isUser ? "flex-end" : "flex-start",
            marginBottom: "0.75rem",
          }}
        >
          <div
            style={{
              maxWidth: "85%",
              background: isUser
                ? "linear-gradient(135deg,#10b981,#34d399)"
                : "linear-gradient(135deg,rgba(30,41,59,0.95), rgba(51,65,85,0.95))",
              color: isUser ? "#fff" : "#e2e8f0",
              padding: "0.85rem 1rem",
              borderRadius: "1rem",
              border: `1px solid ${
                isUser ? "rgba(16,185,129,0.4)" : "rgba(71,85,105,0.6)"
              }`,
              boxShadow: isUser
                ? "0 10px 22px rgba(16,185,129,0.35)"
                : "0 12px 22px rgba(0,0,0,0.35)",
            }}
          >
            {isUser ? (
              <div style={{ fontSize: "0.95rem", lineHeight: 1.5 }}>
                {message.content}
              </div>
            ) : (
              <div style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                <MarkdownRenderer content={message.content} />
              </div>
            )}
            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.75rem",
                color: isUser
                  ? "rgba(255,255,255,0.8)"
                  : "rgba(148,163,184,0.9)",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              {message.timestamp}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: "1px solid rgba(51, 65, 85, 0.6)",
        borderRadius: "1rem",
        background: "rgba(15, 23, 42, 0.95)",
        boxShadow: "0 24px 45px -18px rgba(0,0,0,0.65)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid rgba(51,65,85,0.4)",
          background: "rgba(30,41,59,0.95)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg,#10b981,#34d399)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px rgba(16,185,129,0.35)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <div
              style={{ fontSize: "0.9rem", fontWeight: 700, color: "#34d399" }}
            >
              Page Chat Assistant
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              Ask focused questions about the current page
            </div>
          </div>
        </div>
        {isExtractingContent && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.3rem 0.8rem",
              borderRadius: "999px",
              border: "1px solid rgba(16,185,129,0.35)",
              background: "rgba(16,185,129,0.12)",
              fontSize: "0.7rem",
              color: "#6ee7b7",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                border: "2px solid rgba(16,185,129,0.5)",
                borderTopColor: "#34d399",
                animation: "samai-spin 0.6s linear infinite",
              }}
            />
            Reading page…
          </div>
        )}
      </div>

      {!isApiKeySet ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div>
            <div
              style={{
                width: "70px",
                height: "70px",
                margin: "0 auto 1rem",
                borderRadius: "18px",
                background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 14px 26px rgba(245,158,11,0.35)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#fcd34d",
                marginBottom: "0.5rem",
              }}
            >
              API key required
            </div>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#cbd5f5",
                marginBottom: "1.25rem",
              }}
            >
              Configure your Gemini API key to start chatting with page context.
            </p>
            <button
              onClick={onOpenApiKey}
              style={{
                padding: "0.8rem 1.6rem",
                borderRadius: "0.85rem",
                background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
                border: "none",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 12px 24px rgba(245,158,11,0.35)",
              }}
            >
              Configure API key
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              flex: 1,
              padding: "0.75rem",
              overflowY: "auto",
              minHeight: 0,
            }}
          >
            {renderMessages()}
            {(isChatLoading || isExtractingContent) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginTop: "0.5rem",
                }}
              >
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "1rem",
                    border: "1px solid rgba(71,85,105,0.5)",
                    background: "rgba(30,41,59,0.85)",
                    color: "#34d399",
                    fontSize: "0.85rem",
                  }}
                >
                  {isExtractingContent
                    ? "Reading page content…"
                    : "AI is thinking…"}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: "0.75rem",
              borderTop: "1px solid rgba(51,65,85,0.4)",
              background: "rgba(30,41,59,0.95)",
            }}
          >
            <form
              onSubmit={onSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.25rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.8rem",
                    color: "#cbd5f5",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={includePageContent}
                    onChange={(e) => onIncludePageContentChange(e.target.checked)}
                    style={{
                      width: "14px",
                      height: "14px",
                      accentColor: "#10b981",
                      cursor: "pointer",
                    }}
                  />
                  Include page content
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => onInputChange(e.target.value)}
                    placeholder={
                      includePageContent
                        ? "Ask about this page…"
                        : "Ask anything…"
                    }
                    disabled={isChatLoading || isExtractingContent}
                    style={{
                      width: "100%",
                      height: "44px",
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(71,85,105,0.6)",
                      background: "rgba(15,23,42,0.85)",
                      color: "#f1f5f9",
                      padding: "0 2.75rem 0 0.875rem",
                      fontSize: "0.9rem",
                      transition: "all 0.2s",
                    }}
                  />
                  {(isChatLoading || isExtractingContent) && (
                    <div
                      style={{
                        position: "absolute",
                        right: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <LoadingSpinner size="sm" color="success" />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={
                    isChatLoading || isExtractingContent || !chatInput.trim()
                  }
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "0.75rem",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: chatInput.trim()
                      ? "linear-gradient(135deg, #10b981, #34d399)"
                      : "linear-gradient(135deg, #6b7280, #9ca3af)",
                    color: "#fff",
                    cursor: chatInput.trim() ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    boxShadow: chatInput.trim()
                      ? "0 4px 16px rgba(16, 185, 129, 0.4)"
                      : "none",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
