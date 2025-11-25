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
    <div style={{ 
      height: '100%', 
      overflowY: 'auto',
      padding: '1rem',
    }}>
      <div style={{ 
        marginBottom: "1.5rem",
      }}>
        {response ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
            border: '1px solid rgba(79, 70, 229, 0.3)',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 10px 30px -10px rgba(79, 70, 229, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
          }}>
            {outputFormat === "html" ? (
              <div
                style={{
                  maxWidth: 'none',
                  color: '#f1f5f9',
                  lineHeight: '1.75',
                  fontSize: '14px',
                }}
                dangerouslySetInnerHTML={{ __html: response }}
              />
            ) : (
              <div style={{
                maxWidth: 'none',
                color: '#f1f5f9',
                lineHeight: '1.75',
                fontSize: '14px',
              }}>
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
              minHeight: "400px",
              textAlign: "center",
              padding: "2rem",
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
              border: '1px solid rgba(79, 70, 229, 0.3)',
              borderRadius: '1rem',
              boxShadow: '0 10px 30px -10px rgba(79, 70, 229, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
              animation: 'samai-fade-in 0.3s ease-out',
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "1.5rem",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(129, 140, 248, 0.15))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.3)',
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
                padding: "14px 28px",
                fontWeight: 600,
                color: "white",
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                fontSize: "14px",
                boxShadow: "0 8px 20px -4px rgba(99, 102, 241, 0.4), 0 4px 12px -2px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                letterSpacing: "0.025em",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 12px 28px -4px rgba(99, 102, 241, 0.5), 0 6px 16px -2px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 20px -4px rgba(99, 102, 241, 0.4), 0 4px 12px -2px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
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
              minHeight: "400px",
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
              border: '1px solid rgba(79, 70, 229, 0.3)',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 10px 30px -10px rgba(79, 70, 229, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <LoadingSpinner size="lg" color="primary" />
            <div
              style={{
                marginTop: "1.5rem",
                color: "#cbd5e1",
                fontWeight: 600,
                fontSize: "15px",
                letterSpacing: "0.5px",
                background: 'linear-gradient(135deg, #818cf8, #a5b4fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Generating insights...
            </div>
            <p style={{
              marginTop: "0.75rem",
              color: "#94a3b8",
              fontSize: "13px",
              fontWeight: 400,
            }}>
              Analyzing page content with AI
            </p>
          </div>
        )}
      </div>
    </div>
  );
};