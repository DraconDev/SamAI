import React from 'react';
import { MarkdownRenderer } from '@/utils/markdown';
import type { OutputFormat } from '@/utils/page-content';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

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
    <>
      <div style={{ marginBottom: "20px" }}>
        {response ? (
          outputFormat === "html" ? (
            <div
              style={{
                maxWidth: 'none',
                color: '#f1f5f9',
                lineHeight: '1.7',
                fontSize: '14px',
              }}
              dangerouslySetInnerHTML={{ __html: response }}
            />
          ) : (
            <div style={{
              maxWidth: 'none',
              color: '#f1f5f9',
              lineHeight: '1.7',
              fontSize: '14px',
            }}>
              <MarkdownRenderer content={response} />
            </div>
          )
        ) : !isApiKeySet ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "300px",
              textAlign: "center",
              padding: "0 20px",
              animation: 'samai-fade-in 0.3s ease-out',
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "20px",
                background: "rgba(79, 70, 229, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px",
                border: "1px solid rgba(79, 70, 229, 0.2)",
              }}
            >
              <svg
                width="32"
                height="32"
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
                fontSize: "18px",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#fff",
              }}
            >
              Setup Required
            </h4>
            <p
              style={{
                fontSize: "14px",
                color: "#94a3b8",
                marginBottom: "24px",
                lineHeight: "1.5",
              }}
            >
              Please configure your API key to start using SamAI's powerful
              features.
            </p>
            <button
              onClick={handleOpenApiKey}
              style={{
                padding: "12px 24px",
                fontWeight: 600,
                color: "white",
                background: "linear-gradient(135deg, #4f46e5, #818cf8)",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
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
              height: "300px",
            }}
          >
            <LoadingSpinner size="lg" color="primary" />
            <div
              style={{
                marginTop: "24px",
                color: "#94a3b8",
                fontWeight: 500,
                fontSize: "14px",
                letterSpacing: "0.5px",
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            >
              Generating insights...
            </div>
          </div>
        )}
      </div>
    </>
  );
};