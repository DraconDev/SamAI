import { generateFormResponse } from "@/utils/ai/gemini";
import {
  type OutputFormat,
  extractPageContentAsync as getPageContent,
} from "@/utils/page-content";
import { apiKeyStore } from "@/utils/store";
import React, { useRef, useState } from "react";
import {
  ChatTab,
  FormTab,
  ImageTab,
  ScrapeTab,
  SearchTab,
  SummaryTab,
  TabNavigation,
  type TabId,
} from "./SearchPanel/components";

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
  const [chatMessages, setChatMessages] = useState<
    Array<{
      role: "user" | "assistant";
      content: string;
      timestamp: string;
    }>
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isExtractingContent, setIsExtractingContent] = useState(false);
  const [includePageContent, setIncludePageContent] = useState(true);

  const [scrapeMode, setScrapeMode] = useState<OutputFormat>(outputFormat);
  const [scrapeInstructions, setScrapeInstructions] = useState("");
  const [scrapedContent, setScrapedContent] = useState<string | null>(null);

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

  // Handlers
  const handleScrape = async () => {
    setIsScraping(true);
    try {
      const content = await getPageContent(scrapeMode, true);
      setScrapedContent(content);
    } catch (error) {
      console.error("Error scraping page:", error);
    } finally {
      setIsScraping(false);
    }
  };

  const handleOpenScrapedChat = async () => {
    if (!scrapedContent) return;
    await browser.storage.local.set({
      pageContext: {
        content: scrapedContent,
        outputFormat: scrapeMode,
        instructions: scrapeInstructions,
      },
    });
    await browser.tabs.create({ url: "chat.html" });
    onClose();
  };

  const handleDownloadScraped = () => {
    if (!scrapedContent) return;
    const extension = scrapeMode === "html" ? "html" : "txt";
    const blob = new Blob([scrapedContent], {
      type: scrapeMode === "html" ? "text/html" : "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scraped-page-${new Date()
      .toISOString()
      .slice(0, 10)}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.removeChild(a);
    URL.revokeObjectURL(url);
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
      const content = await getPageContent(outputFormat);
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
      const content = await getPageContent(outputFormat);
      const prompt = `Please provide a comprehensive summary of the following content. Focus on the main points, key information, and important details. Structure your summary with clear sections and bullet points where appropriate.

Content to summarize:
${content}`;

      const summaryText = await generateFormResponse(prompt);
      if (!summaryText) {
        throw new Error(
          "No summary received from AI. Please check your API key configuration."
        );
      }
      setSummary(summaryText);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to summarize page";
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

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);
    setIsExtractingContent(true);

    try {
      let fullPrompt = chatInput;

      if (includePageContent) {
        setIsExtractingContent(true);
        const currentPageContent = await getPageContent(outputFormat);
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

      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending chat message:", error);
      const errorMessage = {
        role: "assistant" as const,
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
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
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '100vh',
        padding: '1.5rem',
        overflow: 'hidden',
        boxSizing: 'border-box',
        animation: 'samai-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div style={{ flexShrink: 0, marginBottom: '1rem' }}>
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onChatClick={handleChat}
          onSummarizeClick={handleSummarize}
          onFormClick={handleForm}
          onImageClick={handleImage}
        />
      </div>

      <div style={{ 
        flex: 1, 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 0
      }}>
        {activeTab === "search" && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <SearchTab
              response={response}
              isApiKeySet={isApiKeySet}
              outputFormat={outputFormat}
            />
          </div>
        )}

        {activeTab === "scrape" && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <ScrapeTab
              isScraping={isScraping}
              scrapeMode={scrapeMode}
              onScrapeModeChange={setScrapeMode}
              scrapeInstructions={scrapeInstructions}
              onScrapeInstructionsChange={setScrapeInstructions}
              scrapedContent={scrapedContent}
              onScrape={handleScrape}
              onOpenChat={handleOpenScrapedChat}
              onDownload={handleDownloadScraped}
              onClearPreview={() => setScrapedContent(null)}
            />
          </div>
        )}

        {activeTab === "chat" && (
          <ChatTab
            isApiKeySet={isApiKeySet}
            isExtractingContent={isExtractingContent}
            isChatLoading={isChatLoading}
            chatMessages={chatMessages}
            chatInput={chatInput}
            includePageContent={includePageContent}
            outputFormat={outputFormat}
            messagesEndRef={messagesEndRef}
            onInputChange={setChatInput}
            onSubmit={handleSendChatMessage}
            onIncludePageContentChange={setIncludePageContent}
            onOpenApiKey={handleOpenApiKey}
          />
        )}

        {activeTab === "sum" && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <SummaryTab
              isSummarizing={isSummarizing}
              summary={summary}
              summaryError={summaryError}
            />
          </div>
        )}

        {activeTab === "form" && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <FormTab onFormClick={handleForm} />
          </div>
        )}

        {activeTab === "image" && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <ImageTab onImageClick={handleImage} />
          </div>
        )}
      </div>
    </div>
  );
}
