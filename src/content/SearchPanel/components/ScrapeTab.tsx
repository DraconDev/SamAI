import React from 'react';
import { GradientButton } from '@/src/components/ui/GradientButton';

interface ScrapeTabProps {
  isScraping: boolean;
  onScrape: () => void;
}

export const ScrapeTab: React.FC<ScrapeTabProps> = ({
  isScraping,
  onScrape,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-[#1E1F2E]/80 rounded-xl border border-[#2E2F3E]/60">
        <h3 className="text-lg font-bold mb-3 text-transparent bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] bg-clip-text">
          Page Scraper
        </h3>
        <p className="mb-4 text-sm text-gray-400">
          Extract content from the current page and send it to chat for
          analysis.
        </p>
        <GradientButton
          onClick={onScrape}
          disabled={isScraping}
          variant="success"
          loading={isScraping}
          className="w-full"
        >
          {isScraping ? "Scraping Page..." : "Scrape Page & Open Chat"}
        </GradientButton>
      </div>
    </div>
  );
};