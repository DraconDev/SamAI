import React, { useRef, useState } from 'react';
import { generateFormResponse } from "@/utils/ai/gemini";
import { apiKeyStore } from "@/utils/store";
import { 
  TabNavigation, 
  SearchTab, 
  ScrapeTab, 
  ChatTab, 
  SummaryTab, 
  FormTab, 
  ImageTab,
  type TabId 
} from "./SearchPanel/components";
import type { OutputFormat } from "@/utils/page-content";

interface SearchPanelProps {
  response: string | null;
  onClose: () => void;
  outputFormat: OutputFormat;
}

export default function SearchPanel({
  response,
  onClose,
  outputFormat,
}: SearchPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Core state
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("search");
  
  // Tab-specific state
  const [isScraping, setIsScraping] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [summaryError, setSummaryError] = useState<string>("");
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isExtractingContent, setIsExtractingContent] = useState(false);
  const [includePageContent, setIncludePageContent] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Load API key status
  React.useEffect(() => {
    const checkApiKey = async () => {
      const apiKeyData = await apiKeyStore.getValue();
      const provider = apiKeyData.selectedProvider || "google";
      const key = apiKeyData[`${provider}ApiKey` as keyof typeof apiKeyData];
      setIsApiKeySet(!!key);
    };
    checkApiKey();
  }, []);

  // Watch for API key changes
  React.useEffect(() => {
    const unsubscribe = apiKeyStore.watch((newValue) => {
      const provider = newValue.selectedProvider || "google";
      const key = newValue[`${provider}ApiKey` as keyof typeof newValue];
      setIsApiKeySet(!!key);
    });
    return () => unsubscribe();
  }, []);

  // Helper function to extract page content (inline for now)
  const extractPageContent = async (format: OutputFormat, fresh: boolean = false): Promise<string> => {
    try {
      // If not fresh, try storage first
      if (!fresh) {
        const result = await browser.storage.local.get([
          'pageBodyText', 
          'pageOptimizedHtml', 
          'pageContext'
        ]);
        
        const cached = (format === "html" ? result.pageOptimizedHtml : result.pageBodyText) as string;
        if (cached) {
          console.log("[SearchPanel] Using cached content:", cached.length);
          return cached;
        }
      }

      // Extract fresh content from DOM
      console.log("[SearchPanel] Extracting fresh content...");
      let content: string;

      if (format === "html") {
        const fullHtml = document.documentElement.outerHTML;
        const { optimizeHtmlContent } = await import("@/utils/page-content");
        content = optimizeHtmlContent(fullHtml);
      } else {
        content = document.body.innerText.trim();
      }

      if (!content) {
        throw new Error("No readable content found on this page.");
      }

      // Cache the extracted content
      const storageKey = format === "html" ? "pageOptimizedHtml" : "pageBodyText";
      await browser.storage.local.set({ [storageKey]: content });
      
      console.log("[SearchPanel] Fresh content extracted:", content.length);
      return content;
    } catch (error) {
      console.error("[SearchPanel] Error extracting page content:", error);
      throw new Error("Failed to extract page content");
    }
  };

  // Handlers
  const handleScrape = async () => {
    setIsScraping(true);
    try {
      const content = await extractPageContent(outputFormat);
      await browser.storage.local.set({
        pageContext: {
          content,
          outputFormat,
        },
      });
      await browser.tabs.create({ url: "chat.html" });
      onClose();
    } catch (error) {
      console.error("Error scraping page:", error);
    } finally {
      setIsScraping(false);
    }
  };

  const handleForm = () => {
    alert("Form filling feature coming soon!");
  };

  const handleImage = () => {
    window.open(
      "https://aistudio.google.com/prompts/new_chat?model=gemini-2.5-flash-image&utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=",
      "_blank"
    );
  };

  const handleChat = async () => {
    try {
      const content = await extractPageContent(outputFormat);
      await browser.storage.local.set({
        pageContext: {
          content,
          outputFormat,
        },
      });
      await browser.tabs.create({ url: "chat.html" });
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setActiveTab("sum");
    setSummaryError("");
    setSummary("");

    try {
      const content = await extractPageContent(outputFormat);
      const prompt = `Please provide a comprehensive summary of the following content. Focus on the main points, key information, and important details. Structure your summary with clear sections and bullet points where appropriate.

Content to summarize:
${content}`;
      
      const summaryText = await generateFormResponse(prompt);
      if (!summaryText) {
        throw new Error("No summary received from AI. Please check your API key configuration.");
      }
      setSummary(summaryText);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to summarize page";
      setSummaryError(errorMessage);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApiKeySet || !chatInput.trim() || isChatLoading) return;

    const userMessage = {
      role: "user" as const,
      content: chatInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);
    setIsExtractingContent(true);

    try {
      let fullPrompt = chatInput;
      
      if (includePageContent) {
        setIsExtractingContent(true);
        const currentPageContent = await extractPageContent(outputFormat);
        setIsExtractingContent(false);
        
        fullPrompt = `${chatInput}

CURRENT PAGE CONTENT (freshly extracted from the page you're currently viewing):
${currentPageContent}

Please provide a helpful response about the user's question specifically related to the current page content above. Focus on what's actually on this page.`;
      }
      
      const response = await generateFormResponse(fullPrompt);
      if (!response) {
        throw new Error("No response received from AI");
      }

      const aiMessage = {
        role: "assistant" as const,
        content: response,
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending chat message:", error);
      const errorMessage = {
        role: "assistant" as const,
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
      setIsExtractingContent(false);
    }
  };

  const handleOpenApiKey = () => {
    browser.runtime.sendMessage({ type: "openApiKeyPage" });
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
        zIndex: 2147483647,
          onOpenApiKey={handleOpenApiKey}
        />
      )}

      {activeTab === "sum" && (
        <SummaryTab
          isSummarizing={isSummarizing}
          summary={summary}
          summaryError={summaryError}
        />
      )}

      {activeTab === "form" && (
        <FormTab onFormClick={handleForm} />
      )}

      {activeTab === "image" && (
        <ImageTab onImageClick={handleImage} />
      )}
    </div>
  );
}
