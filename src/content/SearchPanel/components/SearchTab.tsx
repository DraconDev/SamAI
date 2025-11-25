import { LoadingSpinner } from "@/src/components/ui/LoadingSpinner";
import { MarkdownRenderer } from "@/utils/markdown";
import type { OutputFormat } from "@/utils/page-content";
import React from "react";

interface SearchTabProps {
  response: string | null;
  isApiKeySet: boolean;
  outputFormat: OutputFormat;
}

export const SearchTab: React.FC<SearchTabProps> = ({
  response,
  isApiKeySet,
  outputFormat,
}) => {
  const handleOpenApiKey = () => {
    browser.runtime.sendMessage({ type: "openApiKeyPage" });
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
              background: "linear-gradient(135deg,#6366f1,#818cf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px rgba(99, 102, 241, 0.35)",
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
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <div>
            <div
              style={{ fontSize: "0.9rem", fontWeight: 700, color: "#818cf8" }}
            >
              Search Results
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              AI-powered page analysis and insights
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
        {response ? (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: "0.75rem",
              padding: "1rem",
              boxShadow: "0 8px 25px -12px rgba(99, 102, 241, 0.25)",
              backdropFilter: "blur(8px)",
            }}
          >
            {outputFormat === "html" ? (
              <div
                style={{
                  maxWidth: "none",
                  color: "#f1f5f9",
                  lineHeight: "1.6",
                  fontSize: "0.9rem",
                }}
                dangerouslySetInnerHTML={{ __html: response }}
              />
            ) : (
              <div
                style={{
                  maxWidth: "none",
                  color: "#f1f5f9",
                  lineHeight: "1.6",
                  fontSize: "0.9rem",
                }}
              >
                <MarkdownRenderer content={response} />
              </div>
            )}
          </div>
        ) : !isApiKeySet ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              textAlign: "center",
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: "0.75rem",
              boxShadow: "0 8px 25px -12px rgba(99, 102, 241, 0.25)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "18px",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(129, 140, 248, 0.15))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                boxShadow: "0 8px 16px rgba(99, 102, 241, 0.3)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#818cf8"
                strokeWidth="2"
              >
                <path
                  d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h4
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                color: "#e2e8f0",
              }}
            >
              Setup Required
            </h4>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                marginBottom: "1rem",
                lineHeight: "1.5",
                maxWidth: "280px",
              }}
            >
              Configure your API key to start using SamAI's powerful search and analysis features.
            </p>
            <button
              onClick={handleOpenApiKey}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.85rem",
                boxShadow: "0 8px 20px -4px rgba(99, 102, 241, 0.4)",
                transition: "all 0.2s",
              }}
            >
              Configure API Key
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: "0.75rem",
              padding: "1rem",
              boxShadow: "0 8px 25px -12px rgba(99, 102, 241, 0.25)",
              backdropFilter: "blur(8px)",
            }}
          >
            <LoadingSpinner size="lg" color="primary" />
            <div
              style={{
                marginTop: "1rem",
                color: "#cbd5e1",
                fontWeight: 600,
                fontSize: "0.9rem",
                background: "linear-gradient(135deg, #818cf8, #a5b4fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Generating insights...
            </div>
            <p
              style={{
                marginTop: "0.5rem",
                color: "#94a3b8",
                fontSize: "0.8rem",
                fontWeight: 400,
              }}
            >
              Analyzing page content with AI
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
