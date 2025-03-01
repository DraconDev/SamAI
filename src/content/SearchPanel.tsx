import React from "react";
import { MarkdownRenderer } from "@/utils/markdown";

interface SearchPanelProps {
  response: string | null;
  onClose: () => void;
}

export default function SearchPanel({ response, onClose }: SearchPanelProps) {
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
        onClick={(e) => {
          e.currentTarget.closest("#samai-panel")?.classList.replace("animate-slide-in", "animate-slide-out");
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
        <div className="h-0.5 w-10 bg-[#4f46e5] mt-2" />
      </div>

      <div className="min-h-[200px]">
        {response ? (
          <MarkdownRenderer content={response} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pt-20">
            <div className="flex flex-col items-center mt-[-40px]">
              <div className="relative w-[50px] h-[50px] mb-4">
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
              <div className="text-[#818cf8] font-medium text-sm tracking-wide animate-pulse">
                Generating insights...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
