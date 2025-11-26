import type { OutputFormat } from "@/utils/page-content";

export type { OutputFormat };

export type TabId =
  | "home"
  | "search"
  | "scrape"
  | "chat"
  | "sum"
  | "form"
  | "image"
  | "screen";

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

export type ScrapeResultFormat = "markdown" | "json" | "table" | "plain";

export interface ScrapeTabProps {
  isScraping: boolean;
  scrapeMode: OutputFormat;
  onScrapeModeChange: (mode: OutputFormat) => void;
  scrapeInstructions: string;
  onScrapeInstructionsChange: (instructions: string) => void;
  scrapeResultFormat: ScrapeResultFormat;
  onScrapeResultFormatChange: (format: ScrapeResultFormat) => void;
  scrapeResult: string | null;
  scrapeError: string | null;
  scrapedContent: string | null;
  onScrape: () => void;
  onOpenChat: () => void;
  onDownload: () => void;
  onClearPreview: () => void;
}
