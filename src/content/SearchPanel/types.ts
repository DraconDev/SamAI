import type { OutputFormat } from "@/utils/page-content";

export type { OutputFormat };

export type TabId = "search" | "scrape" | "chat" | "sum" | "form" | "image";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SearchPanelProps {
  response: string | null;
  onClose: () => void;
  outputFormat: OutputFormat;
}

export interface ScrapeTabProps {
  isScraping: boolean;
  scrapeMode: OutputFormat;
  onScrapeModeChange: (mode: OutputFormat) => void;
  scrapeInstructions: string;
  onScrapeInstructionsChange: (instructions: string) => void;
  scrapedContent: string | null;
  onScrape: () => void;
  onOpenChat: () => void;
  onDownload: () => void;
  onClearPreview: () => void;
}
