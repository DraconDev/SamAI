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
  const [isScraping, setIsScraping] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'scrape' | 'form' | 'image'>('search');

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

  // Handle Scrape button - extract page content and open in chat
  const handleScrape = async () => {
    setIsScraping(true);
    try {
      // Send message to content script to extract page content
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id) {
        const response = await browser.tabs.sendMessage(tabs[0].id, {
          type: 'getPageContent',
          outputFormat: outputFormat
        }) as { content?: string };
        
        if (response?.content) {
          // Store content in pageContextStore
          await browser.storage.local.set({
            pageContext: {
              content: response.content,
              outputFormat: outputFormat
            }
          });
          
          // Open chat page
          await browser.tabs.create({ url: 'chat.html' });
          
          // Close sidebar
          onClose();
        }
      }
    } catch (error) {
      console.error('Error scraping page:', error);
    } finally {
      setIsScraping(false);
    }
  };

  // Handle Form button - placeholder for now
  const handleForm = () => {
    alert('Form filling feature coming soon!');
  };

  // Handle Image button - placeholder for now  
  const handleImage = () => {
    alert('Image generation options coming soon!');
  };

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
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 p-1 bg-[#0D0E16]/50 rounded-xl border border-[#2E2F3E]/50" style={{ backdropFilter: 'blur(8px)' }}>
        {/* Search Tab */}
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
            activeTab === 'search'
              ? 'bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white shadow-lg shadow-[#4f46e5]/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E1F2E]/50'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <span>Search</span>
        </button>

        {/* Scrape Tab */}
        <button
          onClick={() => setActiveTab('scrape')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
            activeTab === 'scrape'
              ? 'bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white shadow-lg shadow-[#3b82f6]/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E1F2E]/50'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span>Scrape</span>
        </button>

        {/* Form Tab */}
        <button
          onClick={() => setActiveTab('form')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
            activeTab === 'form'
              ? 'bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white shadow-lg shadow-[#8b5cf6]/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E1F2E]/50'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span>Form</span>
        </button>

        {/* Image Tab */}
        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
            activeTab === 'image'
              ? 'bg-gradient-to-r from-[#ec4899] to-[#f472b6] text-white shadow-lg shadow-[#ec4899]/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E1F2E]/50'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>Image</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'search' && (
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
      )}

      {/* Scrape Tab Content */}
      {activeTab === 'scrape' && (
        <div className="space-y-4">
          <div className="p-6 bg-[#1E1F2E]/80 rounded-xl border border-[#2E2F3E]/60">
            <h3 className="text-lg font-bold mb-3 text-transparent bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] bg-clip-text">
              Page Scraper
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Extract content from the current page and send it to chat for analysis.
            </p>
            <button
              onClick={handleScrape}
              disabled={isScraping}
              className="w-full p-4 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-[#3b82f6]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScraping ? 'Scraping Page...' : 'Scrape Page & Open Chat'}
            </button>
          </div>
        </div>
      )}

      {/* Form Tab Content */}
      {activeTab === 'form' && (
        <div className="space-y-4">
          <div className="p-6 bg-[#1E1F2E]/80 rounded-xl border border-[#2E2F3E]/60">
            <h3 className="text-lg font-bold mb-3 text-transparent bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] bg-clip-text">
              Smart Form Filler
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              AI-powered form filling feature coming soon!
            </p>
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-[#8b5cf6]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <p className="text-gray-500 text-sm">Feature in development</p>
            </div>
          </div>
        </div>
      )}

      {/* Image Tab Content */}
      {activeTab === 'image' && (
        <div className="space-y-4">
          <div className="p-6 bg-[#1E1F2E]/80 rounded-xl border border-[#2E2F3E]/60">
            <h3 className="text-lg font-bold mb-3 text-transparent bg-gradient-to-r from-[#f472b6] to-[#ec4899] bg-clip-text">
              Image Generation
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Quick access to image generation tools.
            </p>
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-[#ec4899]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p className="text-gray-500 text-sm">Feature in development</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
