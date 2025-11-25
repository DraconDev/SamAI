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
    <div className="space-y-4">
      <div className="p-6 bg-[#1E1F2E]/80 rounded-xl border border-[#2E2F3E]/60">
        <h3 className="text-lg font-bold mb-3 text-transparent bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] bg-clip-text">
          Page Scraper
        </h3>
        <p className="mb-4 text-sm text-gray-400">
          Select extraction mode, add optional instructions, scrape for preview,
          then download or open in chat.
        </p>

        {/* Mode Selector */}
        <div className="mb-4 p-4 bg-[#2E2F3E]/50 rounded-xl">
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
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-300">
            Instructions for Chat (Optional)
          </label>
          <textarea
            value={scrapeInstructions}
            onChange={(e) => onScrapeInstructionsChange(e.target.value)}
            placeholder="e.g., 'Summarize key points', 'Extract contact info', 'Analyze structure'..."
            className="w-full p-4 bg-[#1E1F2E]/90 border border-[#4B5563]/60 rounded-2xl text-sm resize-vertical min-h-[100px] focus:outline-none focus:border-[#60a5fa]/70 focus:ring-2 focus:ring-[#60a5fa]/30 transition-all placeholder:text-gray-500"
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
          <div className="p-6 bg-gradient-to-br from-[#3b82f6]/5 to-[#60a5fa]/5 rounded-2xl border-2 border-[#3b82f6]/30">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] bg-clip-text text-transparent">
                📄 Preview ({scrapedContent.length} chars)
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={onClearPreview}
                  className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-xl transition-all duration-200"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="max-h-[400px] overflow-auto rounded-xl border border-[#4B5563]/50 mb-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900/50">
              {scrapeMode === "html" ? (
                <div
                  className="prose prose-invert max-w-none p-6 prose-headings:text-white prose-a:text-[#60a5fa] prose-strong:font-bold"
                  dangerouslySetInnerHTML={{ __html: scrapedContent }}
                />
              ) : (
                <pre className="text-xs bg-[#0D0E16]/80 p-6 rounded-xl font-mono overflow-x-auto whitespace-pre-wrap text-gray-200">
                  {scrapedContent}
                </pre>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <GradientButton
              onClick={onOpenChat}
              variant="success"
              className="py-4 text-lg"
              size="lg"
            >
              💬 Open in Chat
            </GradientButton>
            <GradientButton
              onClick={onDownload}
              variant="secondary"
              className="py-4 text-lg"
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
