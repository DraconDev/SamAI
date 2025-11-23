import { generateFormResponse } from "@/utils/ai/gemini";
import { MarkdownRenderer } from "@/utils/markdown";
import type { OutputFormat } from "@/utils/page-content";
import { apiKeyStore } from "@/utils/store";
import { useEffect, useRef, useState } from "react";
import browser from "webextension-polyfill";

interface SearchPanelProps {
  response: string | null;
  onClose: () => void;
  outputFormat: OutputFormat;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function SearchPanel({
  response,
  onClose,
  outputFormat,
}: SearchPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [summaryError, setSummaryError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "search" | "scrape" | "chat" | "sum" | "form" | "image"
  >("search");
  const [pageBodyText, setPageBodyText] = useState("");
  const [pageOptimizedHtml, setPageOptimizedHtml] = useState("");

  // Chat-related state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isExtractingContent, setIsExtractingContent] = useState(false);
  const [includePageContent, setIncludePageContent] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Small delay to prevent immediate closure on panel creation
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Load API key status on mount
  useEffect(() => {
    const checkApiKey = async () => {
      const apiKeyData = await apiKeyStore.getValue();
      const provider = apiKeyData.selectedProvider || "google";
      const key = apiKeyData[`${provider}ApiKey` as keyof typeof apiKeyData];
      setIsApiKeySet(!!key);
    };
    checkApiKey();
  }, []);

  // Watch for changes in apiKeyStore and update isApiKeySet state
  useEffect(() => {
    const unsubscribe = apiKeyStore.watch((newValue) => {
      const provider = newValue.selectedProvider || "google";
      const key = newValue[`${provider}ApiKey` as keyof typeof newValue];
      setIsApiKeySet(!!key);
    });

    return () => unsubscribe();
  }, []);

  // Load page content from storage (same approach as context popup)
  useEffect(() => {
    const loadPageContent = async () => {
      try {
        const result = await browser.storage.local.get([
          "pageBodyText",
          "pageOptimizedHtml",
          "pageContext",
        ]);
        if (result.pageBodyText) {
          setPageBodyText(result.pageBodyText as string);
        }
        if (result.pageOptimizedHtml) {
          setPageOptimizedHtml(result.pageOptimizedHtml as string);
        }
        console.log("[SamAI Sidebar] Loaded page content from storage");
      } catch (error) {
        console.error("[SamAI Sidebar] Error loading page content:", error);
      }
    };
    loadPageContent();
  }, []);

  // Scroll to bottom when chat messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle Scrape button - extract page content and open in chat
  const handleScrape = async () => {
    setIsScraping(true);
    try {
      // Send message to background script to extract page content
      const response = await browser.runtime.sendMessage({
        type: "extractPageContent",
        outputFormat: outputFormat,
      }) as { content?: string } | undefined;

      if (response?.content) {
        // Store content in pageContextStore
        await browser.storage.local.set({
          pageContext: {
            content: response.content,
            outputFormat: outputFormat,
          },
        });

        // Open chat page
        await browser.tabs.create({ url: "chat.html" });

        // Close sidebar
        onClose();
      }
    } catch (error) {
      console.error("Error scraping page:", error);
    } finally {
      setIsScraping(false);
    }
  };

  // Handle Form button - placeholder for now
  const handleForm = () => {
    alert("Form filling feature coming soon!");
  };

  // Handle Image button - opens Google AI Studio
  const handleImage = () => {
    window.open(
      "https://aistudio.google.com/prompts/new_chat?model=gemini-2.5-flash-image&utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=",
      "_blank"
    );
  };

  // Handle Chat button - opens chat with page as context
  const handleChat = async () => {
    try {
      const response = await browser.runtime.sendMessage({
        type: "extractPageContent",
        outputFormat: outputFormat,
      }) as { content?: string } | undefined;

      if (response?.content) {
        await browser.storage.local.set({
          pageContext: {
            content: response.content,
            outputFormat: outputFormat,
          },
        });
        await browser.tabs.create({ url: "chat.html" });
      }
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  // Handle Sum button - summarize page content
  const handleSummarize = async () => {
    console.log("[SamAI] Starting summarization...");
    setIsSummarizing(true);
    setActiveTab("sum");
    setSummaryError("");
    setSummary("");

    try {
      // Use the same approach as context popup - get content from storage first
      let contentToAnalyze = outputFormat === "html" ? pageOptimizedHtml : pageBodyText;

      // If no content in storage, extract it directly (like content script does)
      if (!contentToAnalyze) {
        console.log("[SamAI] No stored content found, extracting directly from page");
        
        // Extract content directly from the current page
        try {
          if (outputFormat === "html") {
            const fullHtml = document.documentElement.outerHTML;
            contentToAnalyze = optimizeHtmlContent(fullHtml);
          } else {
            const content = document.body.innerText;
            contentToAnalyze = content.trim();
          }
        } catch (error) {
          console.error("[SamAI] Error extracting page content:", error);
          throw new Error("Failed to extract page content");
        }
        
        if (!contentToAnalyze || contentToAnalyze.trim().length === 0) {
          throw new Error("No readable content found on this page.");
        }

        // Store it for future use
        if (outputFormat === "text") {
          setPageBodyText(contentToAnalyze);
          await browser.storage.local.set({ pageBodyText: contentToAnalyze });
        } else {
          setPageOptimizedHtml(contentToAnalyze);
          await browser.storage.local.set({ pageOptimizedHtml: contentToAnalyze });
        }
      }

      console.log("[SamAI] Using content length:", contentToAnalyze.length);

      // Create a proper summarization prompt
      const prompt = `Please provide a comprehensive summary of the following content. Focus on the main points, key information, and important details. Structure your summary with clear sections and bullet points where appropriate.

Content to summarize:
${contentToAnalyze}`;

      console.log("[SamAI] Calling AI for summarization...");
      
      // Call AI to generate summary
      const summaryText = await generateFormResponse(prompt);

      if (!summaryText) {
        throw new Error("No summary received from AI. Please check your API key configuration.");
      }

      console.log("[SamAI] Summary generated successfully");
      setSummary(summaryText);
    } catch (error) {
      console.error("[SamAI] Error summarizing page:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to summarize page";
      setSummaryError(errorMessage);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Helper function to extract current page content - ALWAYS extract fresh content
  const extractCurrentPageContent = async (): Promise<string> => {
    try {
      console.log("[SamAI Chat] Extracting fresh content from current page...");
      
      let contentToAnalyze = "";
      
      // ALWAYS extract fresh content from the current page DOM, ignore cached content
      if (outputFormat === "html") {
        const fullHtml = document.documentElement.outerHTML;
        contentToAnalyze = optimizeHtmlContent(fullHtml);
      } else {
        const content = document.body.innerText;
        contentToAnalyze = content.trim();
      }
      
      if (!contentToAnalyze || contentToAnalyze.trim().length === 0) {
        throw new Error("No readable content found on this page.");
      }

      console.log("[SamAI Chat] Fresh content extracted, length:", contentToAnalyze.length);
      
      // Store it for future use (but we always extract fresh for chat)
      if (outputFormat === "text") {
        setPageBodyText(contentToAnalyze);
        await browser.storage.local.set({ pageBodyText: contentToAnalyze });
      } else {
        setPageOptimizedHtml(contentToAnalyze);
        await browser.storage.local.set({ pageOptimizedHtml: contentToAnalyze });
      }

      return contentToAnalyze;
    } catch (error) {
      console.error("[SamAI Chat] Error extracting page content:", error);
      throw new Error("Failed to extract page content");
    }
  };

  // Handle chat message sending with fresh page context
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApiKeySet || !chatInput.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Add user message
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);
    setIsExtractingContent(true);

    try {
      let fullPrompt = chatInput;
      
      // Only extract page content if checkbox is enabled
      if (includePageContent) {
        setIsExtractingContent(true);
        const currentPageContent = await extractCurrentPageContent();
        setIsExtractingContent(false);
        
        // Prepare the prompt with current page context
        fullPrompt = `${chatInput}

CURRENT PAGE CONTENT (freshly extracted from the page you're currently viewing):
${currentPageContent}

Please provide a helpful response about the user's question specifically related to the current page content above. Focus on what's actually on this page.`;

        console.log("[SamAI Chat] Sending prompt with fresh page context...");
        console.log("[SamAI Chat] Page URL:", window.location.href);
      } else {
        console.log("[SamAI Chat] Sending prompt without page context");
      }
      
      const response = await generateFormResponse(fullPrompt);
      
      if (!response) {
        throw new Error("No response received from AI");
      }

      const aiMessage: ChatMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending chat message:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
      setIsExtractingContent(false);
    }
  };

  // Helper function to optimize HTML content
  const optimizeHtmlContent = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Remove script, style, and other non-content/embedding tags
    doc
      .querySelectorAll(
        "script, style, noscript, link, meta, iframe, svg, canvas, audio, video, picture, source, map, area, track, embed, object"
      )
      .forEach((el) => el.remove());

    // Remove comments
    const comments = doc.createTreeWalker(
      doc.documentElement,
      NodeFilter.SHOW_COMMENT,
      null
    );
    let node;
    while ((node = comments.nextNode())) {
      node.parentNode?.removeChild(node);
    }

    // Get the cleaned HTML string
    let cleanedHtml = doc.documentElement.outerHTML;

    // Collapse multiple whitespace characters into a single space
    cleanedHtml = cleanedHtml.replace(/\s+/g, " ").trim();

    return cleanedHtml;
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
        zIndex: 2147483647, // Max z-index
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
        color: "#e2e8f0",
      }}
      className="animate-slide-in"
    >
      {/* Tab Navigation - 2 Row Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "6px",
          marginBottom: "24px",
          padding: "10px",
          background: "linear-gradient(135deg, #0D0E16, #1a1b2e)",
          borderRadius: "16px",
          border: "1px solid #2E2F3E",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Row 1 - Main Actions */}
        {[
          {
            id: "search" as const,
            label: "Search",
            gradient: "linear-gradient(90deg, #4f46e5, #6366f1, #818cf8)",
            shadow: "rgba(79, 70, 229, 0.5)",
            icon: (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            ),
          },
          {
            id: "scrape" as const,
            label: "Scrape",
            gradient: "linear-gradient(90deg, #3b82f6, #2563eb, #60a5fa)",
            shadow: "rgba(59, 130, 246, 0.5)",
            icon: (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            ),
          },
          {
            id: "chat" as const,
            label: "Chat",
            gradient: "linear-gradient(90deg, #10b981, #059669, #34d399)",
            shadow: "rgba(16, 185, 129, 0.5)",
            icon: (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            ),
          },
          {
            id: "sum" as const,
            label: "Sum",
            gradient: "linear-gradient(90deg, #f59e0b, #d97706, #fbbf24)",
            shadow: "rgba(245, 158, 11, 0.5)",
            icon: (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="21" y1="10" x2="3" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="21" y1="18" x2="3" y2="18" />
              </svg>
            ),
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              console.log("[SamAI] Tab clicked:", tab.id);
              setActiveTab(tab.id);
              if (tab.id === "chat") handleChat();
              if (tab.id === "sum") handleSummarize();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px 12px",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "13px",
              border:
                activeTab === tab.id
                  ? "none"
                  : "1px solid rgba(46, 47, 62, 0.3)",
              background:
                activeTab === tab.id ? tab.gradient : "rgba(30, 31, 46, 0.4)",
              color: activeTab === tab.id ? "white" : "#9ca3af",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow:
                activeTab === tab.id
                  ? `0 20px 25px -5px ${tab.shadow}, 0 10px 10px -5px ${tab.shadow}`
                  : "none",
              transform: activeTab === tab.id ? "scale(1.02)" : "scale(1)",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = "rgba(30, 31, 46, 0.8)";
                e.currentTarget.style.color = "#d1d5db";
                e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgba(0, 0, 0, 0.3)";
                e.currentTarget.style.transform = "scale(1.01)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = "rgba(30, 31, 46, 0.4)";
                e.currentTarget.style.color = "#9ca3af";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}

        {/* Row 2 - Secondary Actions */}
        {[
          {
            id: "form" as const,
            label: "Form",
            gradient: "linear-gradient(90deg, #8b5cf6, #7c3aed, #a78bfa)",
            shadow: "rgba(139, 92, 246, 0.5)",
            icon: (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            ),
          },
          {
            id: "image" as const,
            label: "Image",
            gradient: "linear-gradient(90deg, #ec4899, #db2777, #f472b6)",
            shadow: "rgba(236, 72, 153, 0.5)",
            icon: (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            ),
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === "form") {
                handleForm();
                setActiveTab(tab.id);
              }
              if (tab.id === "image") handleImage();
            }}
            style={{
              gridColumn: tab.id === "form" ? "span 2" : "span 2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px 12px",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "13px",
              border:
                activeTab === tab.id
                  ? "none"
                  : "1px solid rgba(46, 47, 62, 0.3)",
              background:
                activeTab === tab.id ? tab.gradient : "rgba(30, 31, 46, 0.4)",
              color: activeTab === tab.id ? "white" : "#9ca3af",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow:
                activeTab === tab.id
                  ? `0 20px 25px -5px ${tab.shadow}, 0 10px 10px -5px ${tab.shadow}`
                  : "none",
              transform: activeTab === tab.id ? "scale(1.02)" : "scale(1)",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = "rgba(30, 31, 46, 0.8)";
                e.currentTarget.style.color = "#d1d5db";
                e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgba(0, 0, 0, 0.3)";
                e.currentTarget.style.transform = "scale(1.01)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = "rgba(30, 31, 46, 0.4)";
                e.currentTarget.style.color = "#9ca3af";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "search" && (
        <>
          <div style={{ marginBottom: "20px" }}>
            {response ? (
              outputFormat === "html" ? (
                <div
                  className="prose optimized-html-content prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: response }}
                />
              ) : (
                <div className="prose markdown-content prose-invert max-w-none">
                  <MarkdownRenderer content={response} />
                </div>
              )
            ) : !isApiKeySet ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "300px",
                  textAlign: "center",
                  padding: "0 20px",
                }}
                className="animate-fade-in"
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "20px",
                    background: "rgba(79, 70, 229, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "24px",
                    border: "1px solid rgba(79, 70, 229, 0.2)",
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2"
                  >
                    <path
                      d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h4
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "#fff",
                  }}
                >
                  Setup Required
                </h4>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#94a3b8",
                    marginBottom: "24px",
                    lineHeight: "1.5",
                  }}
                >
                  Please configure your API key to start using SamAI's powerful
                  features.
                </p>
                <button
                  onClick={() =>
                    browser.runtime.sendMessage({ type: "openApiKeyPage" })
                  }
                  style={{
                    padding: "12px 24px",
                    fontWeight: 600,
                    color: "white",
                    background: "linear-gradient(135deg, #4f46e5, #818cf8)",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontSize: "14px",
                    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(79, 70, 229, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(79, 70, 229, 0.3)";
                  }}
                >
                  Configure API Key
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "300px",
                }}
              >
                <div className="loading-orb"></div>
                <div
                  style={{
                    marginTop: "24px",
                    color: "#94a3b8",
                    fontWeight: 500,
                    fontSize: "14px",
                    letterSpacing: "0.5px",
                  }}
                  className="animate-pulse"
                >
                  Generating insights...
                </div>
                <style>{`
              .loading-orb {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #4f46e5, #818cf8);
                filter: blur(20px);
                animation: pulse-glow 2s infinite;
              }
              @keyframes pulse-glow {
                0% { transform: scale(0.8); opacity: 0.5; }
                50% { transform: scale(1.2); opacity: 0.8; }
                100% { transform: scale(0.8); opacity: 0.5; }
              }
            `}</style>
              </div>
            )}
          </div>
        </>
      )}

      {/* Scrape Tab Content */}
      {activeTab === "scrape" && (
        <div className="space-y-4">
          <div className="p-6 bg-[#1E1F2E]/80 rounded-xl border border-[#2E2F3E]/60">
            <h3 className="text-lg font-bold mb-3 text-transparent bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] bg-clip-text">
              Page Scraper
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              Extract content from the current page and send it to chat for
              analysis.
            </p>
            <button
              onClick={handleScrape}
              disabled={isScraping}
              className="w-full p-4 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-[#3b82f6]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScraping ? "Scraping Page..." : "Scrape Page & Open Chat"}
            </button>
          </div>
        </div>
      )}

      {/* Chat Tab Content - Fixed and Improved Styling */}
      {activeTab === "chat" && (
        <div
          className="flex flex-col overflow-hidden border shadow-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/95 rounded-2xl border-slate-700/50 backdrop-blur-xl"
          style={{
            height: 'calc(100vh - 280px)',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 25px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/40 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 shadow-lg rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 shadow-emerald-500/30">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-400">
                  Page Chat Assistant
                </h3>
                <p className="text-xs text-slate-400">Ask questions about this page</p>
              </div>
            </div>
            {isExtractingContent && (
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <div className="w-3 h-3 border rounded-full border-emerald-400/30 border-t-emerald-400 animate-spin"></div>
                <span className="font-medium">Reading page...</span>
              </div>
            )}
          </div>

          {!isApiKeySet ? (
            <div className="flex items-center justify-center flex-1 p-6">
              <div className="text-center">
                <div className="flex items-center justify-center mx-auto mb-3 shadow-xl w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-400 shadow-amber-500/30">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-base font-bold text-amber-400">
                  API Key Required
                </h3>
                <button
                  onClick={() => browser.runtime.sendMessage({ type: "openApiKeyLevel" })}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-white font-bold rounded-xl text-xs hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Configure
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Messages Container - Scrollable */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                {chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 shadow-xl rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 shadow-emerald-500/30">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <h4 className="mb-1 text-base font-bold text-emerald-400">Chat Ready</h4>
                      <p className="text-xs text-slate-400">Ask questions about this page</p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex animate-fade-in ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl shadow-xl backdrop-blur-sm border ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-400 text-white ml-4 border-emerald-400/30 shadow-emerald-500/20"
                            : "bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600/60 text-slate-100 mr-4 shadow-black/30"
                        }`}
                      >
                        {message.role === "user" ? (
                          <div className="text-sm font-medium leading-relaxed">{message.content}</div>
                        ) : (
                          <div className="text-sm leading-relaxed prose-sm prose prose-invert max-w-none">
                            <MarkdownRenderer content={message.content} />
                          </div>
                        )}
                        <div className={`text-xs mt-2 opacity-70 flex items-center gap-1 ${
                          message.role === "user" ? "text-emerald-100" : "text-slate-400"
                        }`}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12,6 12,12 16,14" />
                          </svg>
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {(isChatLoading || isExtractingContent) && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="p-4 mr-4 border shadow-xl bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600/60 rounded-2xl backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full shadow-sm bg-emerald-400 animate-bounce" />
                          <div className="w-2 h-2 rounded-full shadow-sm bg-emerald-400 animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="w-2 h-2 rounded-full shadow-sm bg-emerald-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                        <span className="text-xs font-medium text-emerald-400">
                          {isExtractingContent ? "Reading page content..." : "AI is thinking..."}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Chat Input - Fixed at Bottom */}
              <div className="flex-shrink-0 p-4 border-t border-slate-700/40 bg-gradient-to-r from-slate-800/95 to-slate-700/95 backdrop-blur-xl">
                <form onSubmit={handleSendChatMessage} className="space-y-3">
                  {/* Include Page Content Checkbox */}
                  <div className="flex items-center gap-2 pb-2">
                    <input
                      type="checkbox"
                      id="includePageContent"
                      checked={includePageContent}
                      onChange={(e) => setIncludePageContent(e.target.checked)}
                      className="w-4 h-4 rounded cursor-pointer border-slate-600 bg-slate-800 text-emerald-500 focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-0 focus:ring-offset-transparent"
                      style={{
                        accentColor: '#10b981',
                      }}
                    />
                    <label
                      htmlFor="includePageContent"
                      className="text-xs transition-colors cursor-pointer select-none text-slate-400 hover:text-slate-300"
                    >
                      Include page content in chat
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={includePageContent ? "Ask about this page..." : "Ask anything..."}
                        className="w-full h-12 px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out border-2 shadow-lg bg-slate-800/90 border-slate-600/60 rounded-xl text-slate-100 placeholder-slate-400/70 focus:outline-none focus:ring-4 focus:ring-emerald-500/25 focus:border-emerald-500 hover:border-slate-500/80 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: 'rgba(30, 41, 59, 0.9)',
                          borderColor: 'rgba(71, 85, 105, 0.6)',
                        }}
                        disabled={isChatLoading || isExtractingContent}
                      />
                      {(isChatLoading || isExtractingContent) && (
                        <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                          <div className="w-5 h-5 border-2 rounded-full border-emerald-400/30 border-t-emerald-400 animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isChatLoading || isExtractingContent || !chatInput.trim()}
                      className="h-12 px-6 py-3 text-sm font-bold text-white transition-all duration-200 ease-in-out transform border-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/25 border-emerald-400/50 shadow-lg backdrop-blur-sm flex items-center justify-center min-w-[60px]"
                      style={{
                        background: (isChatLoading || isExtractingContent || !chatInput.trim()) 
                          ? 'linear-gradient(to right, #6b7280, #9ca3af)' 
                          : 'linear-gradient(to right, #10b981, #34d399)',
                        borderColor: 'rgba(16, 185, 129, 0.5)',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Press Enter to send</span>
                    <span className="font-medium text-emerald-400">
                      {outputFormat === "html" ? "📄 HTML" : "📝 Text"} mode
                    </span>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "sum" && (
        <div style={{ padding: "24px" }}>
          {isSummarizing ? (
            <div style={{ textAlign: "center" }}>
              <div className="loading-orb"></div>
              <p style={{ color: "#fbbf24", fontSize: "16px", fontWeight: 600, marginTop: "16px" }}>
                Summarizing page content...
              </p>
              <style>{`
                .loading-orb {
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #f59e0b, #fbbf24);
                  filter: blur(10px);
                  animation: pulse-glow 1.5s infinite;
                  margin: 0 auto;
                }
                @keyframes pulse-glow {
                  0% { transform: scale(0.8); opacity: 0.5; }
                  50% { transform: scale(1.2); opacity: 0.8; }
                  100% { transform: scale(0.8); opacity: 0.5; }
                }
              `}</style>
            </div>
          ) : summaryError ? (
            <div style={{ color: "#ef4444", fontSize: "14px" }}>
              <strong>Error:</strong> {summaryError}
            </div>
          ) : summary ? (
            <div className="prose markdown-content prose-invert max-w-none">
              <MarkdownRenderer content={summary} />
            </div>
          ) : (
            <div style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center" }}>
              Click the "Sum" tab to summarize this page.
            </div>
          )}
        </div>
      )}

      {/* Form Tab Content */}
      {activeTab === "form" && (
        <div className="space-y-4">
          <div className="p-6 bg-[#1E1F2E]/80 rounded-xl border border-[#2E2F3E]/60">
            <h3 className="text-lg font-bold mb-3 text-transparent bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] bg-clip-text">
              Smart Form Filler
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              AI-powered form filling feature coming soon!
            </p>
            <div className="py-8 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-[#8b5cf6]/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                />
              </svg>
              <p className="text-sm text-gray-500">Feature in development</p>
            </div>
          </div>
        </div>
      )}

      {/* Image Tab Content */}
      {activeTab === "image" && (
        <div className="space-y-4">
          <div className="p-6 bg-[#1E1F2E]/80 rounded-xl border border-[#2E2F3E]/60">
            <h3 className="text-lg font-bold mb-3 text-transparent bg-gradient-to-r from-[#f472b6] to-[#ec4899] bg-clip-text">
              Image Generation
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              Quick access to image generation tools.
            </p>
            <div className="py-8 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-[#ec4899]/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-sm text-gray-500">Feature in development</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
