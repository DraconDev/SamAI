import React from "react";
import { MarkdownRenderer } from "@/utils/markdown";

interface SearchPanelProps {
  response: string | null;
  onClose: () => void;
}

export default function SearchPanel({ response, onClose }: SearchPanelProps) {
  return (
    <div
      className="fixed top-0 right-0 w-[430px] h-screen bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16] shadow-xl border-l border-white/10 p-6 overflow-y-auto z-50 animate-slide-in"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <button
        onClick={(e) => {
          e.currentTarget.closest("#samai-panel")?.classList.replace("animate-slide-in", "animate-slide-out");
          setTimeout(onClose, 300);
        }}
        className="absolute flex items-center justify-center w-8 h-8 text-gray-300 transition-all duration-200 bg-transparent border-0 rounded-md cursor-pointer top-5 right-5 opacity-60 hover:opacity-100 hover:scale-110"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div className="mb-6">
        <h3 className="m-0 text-xl font-semibold bg-gradient-to-r from-[#818cf8] to-[#4f46e5] bg-clip-text text-transparent pr-8">
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
