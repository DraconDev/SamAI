import { MarkdownRenderer } from "@/utils/markdown";
import type { OutputFormat } from "@/utils/page-content";
import { apiKeyStore } from "@/utils/store";
import { useEffect, useRef, useState } from "react";

interface SearchPanelProps {
  response: string | null;
  onClose: () => void;
  outputFormat: OutputFormat;
}

export default function SearchPanel({ response, onClose, outputFormat }: SearchPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isApiKeySet, setIsApiKeySet] = useState(false);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Small delay to prevent immediate closure on panel creation
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Load API key status on mount
  useEffect(() => {
    const checkApiKey = async () => {
      const apiKeyData = await apiKeyStore.getValue();
      const provider = apiKeyData.selectedProvider || "google";
      const key = apiKeyData[`${provider}ApiKey` as keyof typeof apiKeyData];
      setIsApiKeySet(!!key);
    };
    checkApiKey();
  }, []);

  // Watch for changes in apiKeyStore and update isApiKeySet state
  useEffect(() => {
    const unsubscribe = apiKeyStore.watch((newValue) => {
      const provider = newValue.selectedProvider || "google";
      const key = newValue[`${provider}ApiKey` as keyof typeof newValue];
      setIsApiKeySet(!!key);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "450px",
        height: "100vh",
        background: "rgba(26, 27, 46, 0.95)",
        backdropFilter: "blur(12px)",
        boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
        padding: "32px",
        overflowY: "auto",
        zIndex: 2147483647, // Max z-index
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
        color: "#e2e8f0",
      }}
      className="animate-slide-in"
    >
      <div style={{ marginBottom: "32px" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          marginBottom: "16px" 
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #4f46e5, #818cf8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 700,
              background: "linear-gradient(90deg, #fff, #94a3b8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SamAI
          </h3>
        </div>
        <div
          style={{
            height: "1px",
            width: "100%",
            background: "linear-gradient(90deg, rgba(79, 70, 229, 0.5), transparent)",
          }}
        />
      </div>

      <div style={{ minHeight: "200px" }}>
        {response ? (
          outputFormat === "html" ? (
            <div
              className="optimized-html-content prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: response }}
            />
          ) : (
            <div className="markdown-content prose prose-invert max-w-none">
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
              padding: "0 20px"
            }}
            className="animate-fade-in"
          >
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "rgba(79, 70, 229, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
              border: "1px solid rgba(79, 70, 229, 0.2)"
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h4 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px", color: "#fff" }}>
              Setup Required
            </h4>
            <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "24px", lineHeight: "1.5" }}>
              Please configure your API key to start using SamAI's powerful features.
            </p>
            <button
              onClick={() => browser.runtime.sendMessage({ type: "openApiKeyPage" })}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(79, 70, 229, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.3)";
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
            <div className="loading-orb"></div>
            <div
              style={{
                marginTop: "24px",
                color: "#94a3b8",
                fontWeight: 500,
                fontSize: "14px",
                letterSpacing: "0.5px",
              }}
              className="animate-pulse"
            >
              Generating insights...
            </div>
            <style>{`
              .loading-orb {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #4f46e5, #818cf8);
                filter: blur(20px);
                animation: pulse-glow 2s infinite;
              }
              @keyframes pulse-glow {
                0% { transform: scale(0.8); opacity: 0.5; }
                50% { transform: scale(1.2); opacity: 0.8; }
                100% { transform: scale(0.8); opacity: 0.5; }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}
