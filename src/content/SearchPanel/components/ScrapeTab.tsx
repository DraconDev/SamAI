import { GradientButton } from "@/src/components/ui/GradientButton";
import React from "react";
import type { OutputFormat, ScrapeTabProps } from "../types";

export const ScrapeTab: React.FC<ScrapeTabProps> = ({
  isScraping,
  scrapeMode,
  onScrapeModeChange,
  scrapeInstructions,
  onScrapeInstructionsChange,
  scrapedContent,
  onScrape,
  onOpenChat,
  onDownload,
  onClearPreview,
}) => {
  return (
    <div className="flex flex-col p-4 space-y-6 border shadow-2xl bg-gradient-to-b from-slate-900/95 to-slate-800/90 rounded-3xl border-slate-700/50 backdrop-blur-xl">
      <div className="p-8 bg-gradient-to-br from-slate-900/95 via-[#1E1F2E]/90 to-slate-900/80 rounded-3xl border border-blue-500/20 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-600/5" />
        <h3 className="text-lg font-bold mb-3 text-transparent bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] bg-clip-text">
          Page Scraper
        </h3>
        <p className="mb-4 text-sm text-gray-400">
          Select extraction mode, add optional instructions, scrape for preview,
          then download or open in chat.
        </p>

        {/* Mode Selector */}
        <div className="relative p-6 mb-6 border shadow-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-2xl border-blue-400/30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-transparent to-blue-600/3 rounded-2xl" />
          <label className="block mb-3 text-sm font-medium text-gray-300">
            Extraction Mode
          </label>
          <div className="flex gap-6">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="radio"
                value="text"
                checked={scrapeMode === "text"}
                onChange={(e) => onScrapeModeChange("text" as OutputFormat)}
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
                onChange={(e) => onScrapeModeChange("html" as OutputFormat)}
                className="w-5 h-5 text-[#3b82f6] bg-[#1E1F2E] border-[#4B5563]/60 rounded focus:ring-[#3b82f6] focus:ring-2 transition-all group-hover:border-[#60a5fa]/70"
              />
              <span className="text-sm font-medium group-hover:text-[#60a5fa]">
                HTML
              </span>
            </label>
          </div>
        </div>

        {/* Instructions */}
        <div className="relative mb-8">
          <label className="flex items-center block gap-2 mb-3 text-sm font-semibold text-gray-300">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Instructions for Chat (Optional)
          </label>
          <textarea
            value={scrapeInstructions}
            onChange={(e) => onScrapeInstructionsChange(e.target.value)}
            placeholder="e.g., 'Summarize key points', 'Extract contact info', 'Analyze structure'..."
            className="w-full p-5 bg-gradient-to-r from-slate-900/95 to-[#1E1F2E]/90 border border-blue-500/30 rounded-2xl text-sm resize-vertical min-h-[120px] focus:outline-none focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/20 shadow-xl transition-all placeholder:text-gray-500 placeholder:italic"
            rows={4}
          />
        </div>

        {/* Scrape Button */}
        <GradientButton
          onClick={onScrape}
          disabled={isScraping}
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
      </div>

      {scrapedContent && (
        <>
          {/* Preview Section */}
          <div className="relative p-8 mb-6 overflow-hidden border-2 shadow-2xl bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-blue-500/10 rounded-3xl border-blue-400/40 backdrop-blur-xl">
            <div className="absolute inset-0 opacity-50 bg-gradient-to-r from-blue-500/20 rounded-3xl blur" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h4 className="flex items-center gap-2 text-2xl font-bold text-transparent bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text">
                  📄 Preview
                  <span className="px-3 py-1 text-sm font-medium text-blue-200 rounded-full bg-blue-500/20">
                    {scrapedContent.length} chars
                  </span>
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={onClearPreview}
                    className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:bg-slate-800/50 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                </div>
              </div>
              <div className="max-h-[420px] overflow-auto rounded-2xl border border-blue-500/20 bg-gradient-to-b from-slate-900/80 to-slate-950/50 backdrop-blur-sm mb-6 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-slate-900/50 shadow-inner">
              {scrapeMode === "html" ? (
                <div
                  className="p-8 prose prose-invert max-w-none prose-headings:text-white prose-headings:font-bold prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-strong:font-bold prose-code:text-blue-300"
                  dangerouslySetInnerHTML={{ __html: scrapedContent }}
                />
              ) : (
                <pre className="text-sm bg-gradient-to-b from-slate-900/90 to-[#0D0E16]/90 p-8 rounded-2xl font-mono overflow-x-auto whitespace-pre-wrap text-gray-100 shadow-2xl backdrop-blur-sm border border-slate-700/50">
                  {scrapedContent}
                </pre>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-6 p-6 pt-6 border shadow-2xl bg-gradient-to-r from-blue-500/5 to-blue-600/5 rounded-3xl border-blue-500/20 backdrop-blur-xl">
            <GradientButton
              onClick={onOpenChat}
              variant="success"
              className="py-5 text-xl font-bold shadow-2xl hover:shadow-blue-500/30 h-14"
              size="lg"
            >
              💬 Open in Chat
            </GradientButton>
            <GradientButton
              onClick={onDownload}
              variant="secondary"
              className="py-5 text-xl font-bold shadow-2xl hover:shadow-blue-400/30 h-14"
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
