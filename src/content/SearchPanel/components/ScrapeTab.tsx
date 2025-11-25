import { GradientButton } from "@/src/components/ui/GradientButton";
import { MarkdownRenderer } from "@/utils/markdown";
import React, { useCallback } from "react";
import type {
  OutputFormat,
  ScrapeResultFormat,
  ScrapeTabProps,
} from "../types";

export const ScrapeTab: React.FC<ScrapeTabProps> = ({
  isScraping,
  scrapeMode,
  onScrapeModeChange,
  scrapeInstructions,
  onScrapeInstructionsChange,
  scrapeResultFormat,
  onScrapeResultFormatChange,
  scrapeResult,
  scrapeError,
  scrapedContent,
  onScrape,
  onOpenChat,
  onDownload,
  onClearPreview,
}) => {
  const formatOptions: Array<{
    value: ScrapeResultFormat;
    label: string;
    hint: string;
  }> = [
    {
      value: "markdown",
      label: "Rich Markdown",
      hint: "Headings, bullet points, callouts",
    },
    {
      value: "json",
      label: "Structured JSON",
      hint: "Use when you need key/value data",
    },
    {
      value: "table",
      label: "Markdown Table",
      hint: "Tabular insights",
    },
    {
      value: "plain",
      label: "Plain Text",
      hint: "Simple paragraphs or bullet list",
    },
  ];

  // Handle Enter key press in textarea
  const handleTextareaKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!isScraping && scrapeInstructions.trim()) {
        onScrape();
      }
    }
  }, [isScraping, scrapeInstructions, onScrape]);

  try {
    return (
      <div
        className="space-y-6"
        style={{
          padding: "0.25rem",
          height: "100%",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "1rem",
            padding: "1.25rem",
            boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)",
            marginBottom: "1rem",
          }}
        >
          <div style={{ marginBottom: "1.25rem" }}>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Page Scraper
            </h3>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#94a3b8",
                lineHeight: "1.4",
              }}
            >
              Select extraction mode, add instructions, scrape for preview, then download or open in chat.
            </p>
          </div>

          {/* Mode Selector */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(96, 165, 250, 0.08))",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "0.75rem",
              padding: "1rem",
              marginBottom: "1rem",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.1)",
            }}
          >
            <label 
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.75rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#60a5fa",
              }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Extraction Mode
            </label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <label 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  transition: "all 0.2s",
                  border: scrapeMode === "text" ? "1px solid rgba(59, 130, 246, 0.5)" : "1px solid transparent",
                  background: scrapeMode === "text" ? "rgba(59, 130, 246, 0.1)" : "transparent"
                }}
              >
                <input
                  type="radio"
                  value="text"
                  checked={scrapeMode === "text"}
                  onChange={() => onScrapeModeChange("text" as OutputFormat)}
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "#3b82f6",
                  }}
                />
                <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#e2e8f0" }}>
                  Plain Text
                </span>
              </label>
              <label 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  transition: "all 0.2s",
                  border: scrapeMode === "html" ? "1px solid rgba(59, 130, 246, 0.5)" : "1px solid transparent",
                  background: scrapeMode === "html" ? "rgba(59, 130, 246, 0.1)" : "transparent"
                }}
              >
                <input
                  type="radio"
                  value="html"
                  checked={scrapeMode === "html"}
                  onChange={() => onScrapeModeChange("html" as OutputFormat)}
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "#3b82f6",
                  }}
                />
                <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#e2e8f0" }}>
                  HTML
                </span>
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#e2e8f0",
              }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "#60a5fa" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              What should SamAI extract?
            </label>
            <textarea
              value={scrapeInstructions}
              onChange={(e) => onScrapeInstructionsChange(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="e.g., 'List the pros/cons in JSON', 'Extract every event and include time + speaker', 'Summarize FAQs as bullet list'."
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "0.5rem",
                fontSize: "0.8rem",
                resize: "vertical",
                minHeight: "80px",
                color: "#f1f5f9",
                transition: "all 0.2s",
                lineHeight: "1.4",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(96, 165, 250, 0.6)";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(59, 130, 246, 0.3)";
                e.target.style.boxShadow = "none";
              }}
              rows={3}
            />
            <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Press Cmd/Ctrl + Enter to scrape
            </div>
          </div>

          {/* Output format */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#e2e8f0",
              }}
            >
              Output format
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "0.5rem",
              }}
            >
              {formatOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onScrapeResultFormatChange(option.value)}
                  style={{
                    borderRadius: "0.5rem",
                    padding: "0.6rem 0.75rem",
                    border:
                      scrapeResultFormat === option.value
                        ? "1px solid rgba(59, 130, 246, 0.6)"
                        : "1px solid rgba(71, 85, 105, 0.4)",
                    background:
                      scrapeResultFormat === option.value
                        ? "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15))"
                        : "rgba(15, 23, 42, 0.6)",
                    color: "#e2e8f0",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "0.8rem" }}>
                    {option.label}
                  </div>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: "#94a3b8",
                      marginTop: "0.2rem",
                      lineHeight: "1.2",
                    }}
                  >
                    {option.hint}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Scrape Button */}
          <button
            onClick={onScrape}
            disabled={isScraping || !scrapeInstructions.trim()}
            style={{
              width: "100%",
              padding: "0.875rem 1.25rem",
              background: isScraping || !scrapeInstructions.trim() 
                ? "linear-gradient(135deg, rgba(71, 85, 105, 0.6), rgba(51, 65, 85, 0.6))"
                : "linear-gradient(135deg, #3b82f6, #60a5fa)",
              border: "none",
              borderRadius: "0.75rem",
              color: "white",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: isScraping || !scrapeInstructions.trim() ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: isScraping || !scrapeInstructions.trim() 
                ? "none" 
                : "0 8px 25px -8px rgba(59, 130, 246, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              letterSpacing: "0.025em",
            }}
          >
            {isScraping ? (
              <>
                <div style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
                Scraping Page...
              </>
            ) : scrapedContent ? (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Re-scrape Page
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Scrape Page
              </>
            )}
          </button>
          
          {scrapeError && (
            <div
              style={{
                marginTop: "0.75rem",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(248, 113, 113, 0.4)",
                background: "rgba(248, 113, 113, 0.1)",
                color: "#fecaca",
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {scrapeError}
            </div>
          )}
        </div>

        {(scrapedContent || scrapeResult) && (
          <>
            {scrapedContent && (
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(96, 165, 250, 0.08))",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  marginBottom: "1rem",
                  boxShadow: "0 8px 25px -10px rgba(59, 130, 246, 0.2)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <h4 style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#60a5fa",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    🧱 Source Content
                  </h4>
                  <button
                    onClick={onClearPreview}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      padding: "0.375rem 0.75rem",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "#94a3b8",
                      background: "rgba(30, 41, 59, 0.6)",
                      border: "1px solid rgba(71, 85, 105, 0.4)",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(51, 65, 85, 0.8)";
                      e.currentTarget.style.color = "#e2e8f0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(30, 41, 59, 0.6)";
                      e.currentTarget.style.color = "#94a3b8";
                    }}
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                </div>
                <div style={{ maxHeight: "300px", overflow: "auto", borderRadius: "0.5rem", border: "1px solid rgba(71, 85, 105, 0.4)" }}>
                  {scrapeMode === "html" ? (
                    <div
                      style={{
                        padding: "0.75rem",
                        background: "rgba(15, 23, 42, 0.9)",
                        fontSize: "0.75rem",
                        color: "#e2e8f0",
                        lineHeight: "1.4",
                      }}
                      dangerouslySetInnerHTML={{ __html: scrapedContent }}
                    />
                  ) : (
                    <pre style={{
                      fontSize: "0.75rem",
                      background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))",
                      padding: "0.75rem",
                      margin: 0,
                      borderRadius: "0.5rem",
                      fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Inconsolata, 'Fira Code', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro', monospace",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                      color: "#e2e8f0",
                      lineHeight: "1.4",
                    }}>
                      {scrapedContent}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {scrapeResult && (
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(15, 118, 110, 0.1), rgba(45, 212, 191, 0.05))",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  marginBottom: "1rem",
                  boxShadow: "0 8px 25px -12px rgba(16, 185, 129, 0.25)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#34d399",
                      margin: 0,
                    }}
                  >
                    🎯 Extraction Result
                  </h4>
                  <span style={{
                    fontSize: "0.7rem",
                    color: "#a7f3d0",
                    background: "rgba(52, 211, 153, 0.1)",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "0.25rem",
                    border: "1px solid rgba(52, 211, 153, 0.2)",
                  }}>
                    {formatOptions.find((option) => option.value === scrapeResultFormat)?.label}
                  </span>
                </div>
                {scrapeResultFormat === "json" ? (
                  <pre style={{
                    fontSize: "0.75rem",
                    padding: "0.75rem",
                    background: "rgba(15, 23, 42, 0.9)",
                    borderRadius: "0.5rem",
                    overflowX: "auto",
                    color: "#d1fae5",
                    border: "1px solid rgba(52, 211, 153, 0.3)",
                    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Inconsolata, 'Fira Code', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro', monospace",
                    lineHeight: "1.4",
                  }}>
                    {scrapeResult}
                  </pre>
                ) : (
                  <div style={{
                    fontSize: "0.8rem",
                    color: "#d1fae5",
                    lineHeight: "1.5",
                  }}>
                    <MarkdownRenderer content={scrapeResult} />
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "0.75rem",
                padding: "0.75rem",
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(96, 165, 250, 0.05))",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "0.75rem",
                boxShadow: "0 8px 25px -10px rgba(59, 130, 246, 0.15)",
                backdropFilter: "blur(12px)",
              }}
            >
              <button
                onClick={onOpenChat}
                disabled={!scrapeResult && !scrapedContent}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #10b981, #34d399)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: !scrapeResult && !scrapedContent ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 15px -5px rgba(16, 185, 129, 0.5)",
                }}
              >
                💬 Open in Chat
              </button>
              <button
                onClick={onDownload}
                disabled={!scrapeResult && !scrapedContent}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: !scrapeResult && !scrapedContent ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 15px -5px rgba(99, 102, 241, 0.5)",
                }}
              >
                💾 Download
              </button>
            </div>
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error("[ScrapeTab] render error", error);
    return (
      <div
        style={{
          padding: "1rem",
          color: "#fca5a5",
          background: "rgba(30, 41, 59, 0.9)",
          borderRadius: "0.75rem",
          border: "1px solid rgba(248, 113, 113, 0.4)",
          fontSize: "0.8rem",
        }}
      >
        Something went wrong while loading the scraper UI.
      </div>
    );
  }
};
