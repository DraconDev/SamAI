import React, { useState, useEffect } from "react"; // Import useState and useEffect
import { MarkdownRenderer } from "@/utils/markdown";
import { apiKeyStore } from "@/utils/store"; // Import apiKeyStore

interface SearchPanelProps {
  response: string | null;
  onClose: () => void;
}

export default function SearchPanel({ response, onClose }: SearchPanelProps) {
  const [isApiKeySet, setIsApiKeySet] = useState(false); // Add isApiKeySet state

  // Load API key status on mount
  useEffect(() => {
    const checkApiKey = async () => {
      const apiKeyData = await apiKeyStore.getValue();
      setIsApiKeySet(!!apiKeyData?.apiKey);
    };
    checkApiKey();
  }, []);

  // Watch for changes in apiKeyStore and update isApiKeySet state
  useEffect(() => {
    const unsubscribe = apiKeyStore.watch((newValue) => {
      setIsApiKeySet(!!newValue?.apiKey);
    });

    // Cleanup the watcher on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '430px',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1b2e, #0D0E16)',
        boxShadow: '-5px 0 15px rgba(0,0,0,0.2)',
        padding: '24px',
        overflowY: 'auto',
        zIndex: 9999,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      className="animate-slide-in"
    >
      <button
        onClick={(e) => {
          e.currentTarget.closest("#samai-container")?.classList.replace("animate-slide-in", "animate-slide-out");
          setTimeout(onClose, 300);
        }}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          opacity: 0.6,
          transition: 'all 0.2s',
          color: '#e2e8f0',
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          margin: 0,
          fontSize: '20px',
          fontWeight: 600,
          background: 'linear-gradient(90deg, #818cf8, #4f46e5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          paddingRight: '32px'
        }}>
          Sam AI Results
        </h3>
        <div style={{ height: '2px', width: '40px', background: '#4f46e5', marginTop: '8px' }} />
      </div>

      <div style={{ minHeight: '200px' }}>
        {response ? (
          <div className="markdown-content">
            <MarkdownRenderer content={response} />
          </div>
        ) : (
          !isApiKeySet ? (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '80px'
            }} className="animate-fade-in">
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '-40px'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '20px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(255, 255, 0, 0.1)', // Yellowish background
                  border: '1px solid rgba(255, 255, 0, 0.3)', // Yellowish border
                  color: '#ffffcc', // Light yellow text
                  textAlign: 'center'
                }}>
                  <p style={{ marginBottom: '15px', fontSize: '15px' }}>
                    Your API key is not set. Please set it to use SamAI.
                  </p>
                  <button
                    onClick={() => browser.tabs.create({ url: "apikey.html" })}
                    style={{
                      padding: '10px 20px',
                      fontWeight: 600,
                      color: '#333', // Dark text for contrast
                      backgroundColor: '#ffcc00', // Yellow button
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Set API Key
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '80px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '-40px'
              }}>
                <div style={{ position: 'relative', width: '50px', height: '50px', marginBottom: '16px' }}>
                  <svg viewBox="0 0 50 50" className="animate-spin">
                    <path
                      d="M25,25 m-20,0 a20,20 0 1,1 40,0 a20,20 0 1,1 -40,0"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div style={{
                  color: '#818cf8',
                  fontWeight: 500,
                  fontSize: '14px',
                  letterSpacing: '0.5px'
                }} className="animate-pulse">
                  Generating insights...
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
