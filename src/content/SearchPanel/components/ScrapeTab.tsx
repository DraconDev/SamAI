import { GradientButton } from "@/src/components/ui/GradientButton";
import { MarkdownRenderer } from "@/utils/markdown";
import React from "react";
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
  const formatOptions: Array<{ value: ScrapeResultFormat; label: string; hint: string }> = [
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

  return (
    <div 
      className="space-y-6"
      style={{
        padding: '1rem',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <div 
        className="p-8 bg-gradient-to-br from-[#1E1F2E]/95 to-slate-900/90 rounded-3xl border border-blue-500/20 shadow-2xl backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Page Scraper
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: '#94a3b8',
            lineHeight: '1.5',
          }}>
            Select extraction mode, add optional instructions, scrape for preview,
            then download or open in chat.
          </p>
        </div>

        {/* Mode Selector */}
        <div 
          className="p-6 mb-6 border shadow-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-400/20 rounded-2xl backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.1))',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '1rem',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
          }}
        >
          <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-blue-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Extraction Mode
          </label>
          <div className="flex gap-6">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="radio"
                value="text"
                checked={scrapeMode === "text"}
                onChange={() => onScrapeModeChange("text" as OutputFormat)}
                className="w-5 h-5 text-[#3b82f6] bg-[#1E1F2E] border-[#4B5563]/60 rounded focus:ring-[#3b82f6] focus:ring-2 transition-all group-hover:border-[#60a5fa]/70"
              />
              <span className="text-sm font-medium group-hover:text-[#60a5fa]">
                Plain Text
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="radio"
                value="html"
                checked={scrapeMode === "html"}
                onChange={() => onScrapeModeChange("html" as OutputFormat)}
                className="w-5 h-5 text-[#3b82f6] bg-[#1E1F2E] border-[#4B5563]/60 rounded focus:ring-[#3b82f6] focus:ring-2 transition-all group-hover:border-[#60a5fa]/70"
              />
              <span className="text-sm font-medium group-hover:text-[#60a5fa]">
                HTML
              </span>
            </label>
          </div>
        </div>

        {/* Instructions */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#e2e8f0',
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#60a5fa' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            What should SamAI extract?
          </label>
          <textarea
            value={scrapeInstructions}
            onChange={(e) => onScrapeInstructionsChange(e.target.value)}
            placeholder="e.g., “List the pros/cons in JSON”, “Extract every event and include time + speaker”, “Summarize FAQs as bullet list”."
            style={{
              width: '100%',
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              resize: 'vertical',
              minHeight: '120px',
              color: '#f1f5f9',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(96, 165, 250, 0.6)';
              e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              e.target.style.boxShadow = 'none';
            }}
            rows={4}
          />
        </div>

        {/* Output format */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#e2e8f0",
            }}
          >
            Desired output format
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {formatOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onScrapeResultFormatChange(option.value)}
                style={{
                  borderRadius: "0.75rem",
                  padding: "0.9rem",
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
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  {option.label}
                </div>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                  {option.hint}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Scrape Button */}
        <GradientButton
          onClick={onScrape}
          disabled={isScraping || !scrapeInstructions.trim()}
          variant="success"
          loading={isScraping}
          className="w-full py-4 text-lg"
          size="lg"
        >
          {isScraping ? (
            <>
              <div className="w-5 h-5 mr-2 border-2 rounded-full border-white/30 border-t-white animate-spin" />
              Scraping Page...
            </>
          ) : scrapedContent ? (
            "🔄 Re-scrape Page"
          ) : (
            "✨ Scrape Page for Preview"
          )}
        </GradientButton>
        {scrapeError && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.9rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(248, 113, 113, 0.4)",
              background: "rgba(248, 113, 113, 0.1)",
              color: "#fecaca",
              fontSize: "0.85rem",
            }}
          >
            {scrapeError}
          </div>
        )}
      </div>

      {(scrapedContent || scrapeResult) && (
        <>
          {scrapedContent && (
            <div 
              className="p-8 border-2 shadow-2xl bg-gradient-to-br from-blue-500/8 to-blue-600/8 rounded-3xl border-blue-400/30 backdrop-blur-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(96, 165, 250, 0.08))',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-center justify-between mb-8">
                <h4 className="flex items-center gap-3 text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text">
                  🧱 Source Preview
                  <span className="text-lg bg-blue-500/20 px-4 py-1.5 rounded-2xl text-blue-100 font-semibold border border-blue-400/30">
                    {scrapedContent.length} chars
                  </span>
                </h4>
                <button
                  onClick={onClearPreview}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/70 backdrop-blur-sm rounded-2xl border border-slate-600/50 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
                    border: '1px solid rgba(71, 85, 105, 0.4)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    letterSpacing: '0.025em',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              </div>
              <div className="max-h-[400px] overflow-auto rounded-xl border border-[#4B5563]/50 mb-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900/50">
                {scrapeMode === "html" ? (
                  <div
                    className="p-8 prose prose-invert max-w-none prose-headings:text-white prose-headings:font-bold prose-a:text-blue-400 prose-strong:font-bold prose-code:text-blue-300 backdrop-blur-sm rounded-2xl"
                    dangerouslySetInnerHTML={{ __html: scrapedContent }}
                  />
                ) : (
                  <pre className="text-sm bg-gradient-to-b from-[#1E1F2E]/95 to-slate-900/90 p-8 rounded-2xl font-mono overflow-x-auto whitespace-pre-wrap text-gray-100 shadow-xl border border-slate-700/50 backdrop-blur-sm">
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
                border: "2px solid rgba(16, 185, 129, 0.25)",
                borderRadius: "1rem",
                padding: "1.5rem",
                marginBottom: "1.5rem",
                boxShadow: "0 10px 30px -12px rgba(16, 185, 129, 0.25)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                  <h4 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#34d399", marginBottom: "0.35rem" }}>
                    🎯 Extraction Result
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "#a7f3d0" }}>
                    Output format: {
                      formatOptions.find((option) => option.value === scrapeResultFormat)?.label
                    }
                  </p>
                </div>
              </div>
              {scrapeResultFormat === "json" ? (
                <pre className="bg-slate-900/80 text-emerald-100 p-5 rounded-2xl text-sm overflow-x-auto border border-emerald-500/30">
                  {scrapeResult}
                </pre>
              ) : (
                <div className="prose prose-invert max-w-none prose-headings:text-emerald-200 prose-strong:text-emerald-100 prose-a:text-emerald-300">
                  <MarkdownRenderer content={scrapeResult} />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div 
            className="grid grid-cols-2 gap-6 p-6 border shadow-2xl bg-gradient-to-r from-blue-500/5 to-blue-600/5 rounded-3xl border-blue-500/20 backdrop-blur-xl"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              padding: '1.25rem',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(96, 165, 250, 0.05))',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '1rem',
              boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.15)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <GradientButton
              onClick={onOpenChat}
              disabled={!scrapeResult && !scrapedContent}
              variant="success"
              className="h-16 py-5 text-xl font-bold shadow-2xl hover:shadow-blue-500/40"
              size="lg"
            >
              💬 Open in Chat
            </GradientButton>
            <GradientButton
              onClick={onDownload}
              disabled={!scrapeResult && !scrapedContent}
              variant="secondary"
              className="h-16 py-5 text-xl font-bold shadow-2xl hover:shadow-blue-400/40"
              size="lg"
            >
              💾 Download
            </GradientButton>
          </div>
        </>
      )}
    </div>
  );
};
