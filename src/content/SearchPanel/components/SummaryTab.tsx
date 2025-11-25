import { LoadingSpinner } from "@/src/components/ui/LoadingSpinner";
import { MarkdownRenderer } from "@/utils/markdown";
import React from "react";

interface SummaryTabProps {
  isSummarizing: boolean;
  summary: string;
  summaryError: string;
  onSummarize?: () => void;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  isSummarizing,
  summary,
  summaryError,
  onSummarize,
}) => {
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
              background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px rgba(245, 158, 11, 0.35)",
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
              <line x1="21" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="3" y2="18" />
            </svg>
          </div>
          <div>
            <div
              style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fbbf24" }}
            >
              Page Summary
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              AI-powered content summarization
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: "0.75rem",
          overflowY: "auto",
          minHeight: 0,
        }}
      >
        {isSummarizing ? (
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              boxShadow: "0 8px 25px -12px rgba(245, 158, 11, 0.25)",
              backdropFilter: "blur(8px)",
            }}
          >
            <LoadingSpinner size="lg" color="warning" />
            <p
              style={{
                color: "#fbbf24",
                fontSize: "0.9rem",
                fontWeight: 600,
                marginTop: "1rem",
                background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Summarizing page content...
            </p>
            <p
              style={{
                marginTop: "0.5rem",
                color: "#94a3b8",
                fontSize: "0.8rem",
                fontWeight: 400,
              }}
            >
              Analyzing and extracting key information
            </p>
          </div>
        ) : summaryError ? (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "0.75rem",
              padding: "1rem",
              color: "#ef4444",
              fontSize: "0.85rem",
              boxShadow: "0 8px 25px -12px rgba(239, 68, 68, 0.25)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <strong style={{ fontSize: "0.9rem" }}>Error:</strong>
            </div>
            <p style={{ color: "#fca5a5", lineHeight: "1.5" }}>{summaryError}</p>
          </div>
        ) : summary ? (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "0.75rem",
              padding: "1rem",
              boxShadow: "0 8px 25px -12px rgba(245, 158, 11, 0.25)",
              backdropFilter: "blur(8px)",
              color: "#f1f5f9",
              lineHeight: "1.6",
            }}
          >
            <div
              style={{
                marginBottom: "0.75rem",
                paddingBottom: "0.75rem",
                borderBottom: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  margin: 0,
                  background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                📄 Page Summary
              </h2>
            </div>
            <MarkdownRenderer content={summary} />
          </div>
        ) : (
          <div
            style={{
              color: "#94a3b8",
              fontSize: "0.85rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "0.75rem",
              padding: "1rem",
              boxShadow: "0 8px 25px -12px rgba(245, 158, 11, 0.25)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "15px",
                background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.15))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                boxShadow: "0 8px 16px rgba(245, 158, 11, 0.3)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
              >
                <line x1="21" y1="10" x2="3" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="21" y1="18" x2="3" y2="18" />
              </svg>
            </div>
            <p
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#cbd5e1",
                marginBottom: "0.5rem",
              }}
            >
              Ready to Summarize
            </p>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
              Click the "Sum" tab to generate a summary of this page
            </p>
            {onSummarize && (
              <button
                onClick={onSummarize}
                disabled={isSummarizing}
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: isSummarizing ? "not-allowed" : "pointer",
                  opacity: isSummarizing ? 0.6 : 1,
                  transition: "all 0.2s",
                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                }}
              >
                {isSummarizing ? "Summarizing..." : "Start Summary"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
