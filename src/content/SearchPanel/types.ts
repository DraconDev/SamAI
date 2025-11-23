import type { OutputFormat } from "@/utils/page-content";

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