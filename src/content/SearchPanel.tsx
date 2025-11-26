import { generateFormResponse } from "@/utils/ai/gemini";
import {
  extractPageContentAsync as getPageContent,
  type OutputFormat,
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
import type { ScrapeResultFormat } from "./SearchPanel/types";

// Define ChatSource locally since it's not exported
type ChatSource = "none" | "page" | "html" | "screen" | "video";

// Simple button finder by text content
const findButtonByText = async (
  buttonDescription: string
): Promise<HTMLElement | null> => {
  console.log(`[SamAI] Searching for button: ${buttonDescription}`);

  // Get all possible buttons
  const allButtons = document.querySelectorAll(
    "button, yt-button-shape button, paper-button, .ytp-button"
  );
  console.log(`[SamAI] Found ${allButtons.length} total buttons to check`);

  for (let i = 0; i < allButtons.length; i++) {
    const button = allButtons[i] as HTMLElement;
    const text = button.textContent?.trim() || "";
    const ariaLabel = button.getAttribute("aria-label")?.toLowerCase() || "";
    const title = button.getAttribute("title")?.toLowerCase() || "";
    const dataTestId = button.getAttribute("data-testid")?.toLowerCase() || "";

    // Keep original case for better matching, but also prepare lowercase version
    const textLower = text.toLowerCase();
    const fullText =
      `${text} ${ariaLabel} ${title} ${dataTestId}`.toLowerCase();
    const fullTextOriginal = `${text} ${ariaLabel} ${title} ${dataTestId}`;

    if (buttonDescription.includes("more")) {
      // Looking for "more" button - check both original and lowercased
      const hasMore = textLower.includes("more") || fullText.includes("more");
      const hasEllipsis =
        text.includes("⋯") ||
        text.includes("...") ||
        text.includes("⋮") ||
        text.includes("⋰");
      const isNotShow = !fullText.includes("show");

      if ((hasMore || hasEllipsis) && isNotShow) {
        console.log(
          `[SamAI] Found more button: "${text || ariaLabel || title}"`
        );
        console.log(
          `[SamAI] Button details - text: "${text}", aria: "${ariaLabel}", title: "${title}"`
        );
        console.log(
          `[SamAI] Matching criteria - hasMore: ${hasMore}, hasEllipsis: ${hasEllipsis}, isNotShow: ${isNotShow}`
        );
        return button;
      }
    } else if (buttonDescription.includes("transcript")) {
      // Looking for transcript button
      if (
        fullText.includes("transcript") ||
        fullText.includes("show transcript") ||
        fullText.includes("show captions") ||
        fullText.includes("closed captions") ||
        textLower.includes("transcript")
      ) {
        console.log(
          `[SamAI] Found transcript button: "${text || ariaLabel || title}"`
        );
        console.log(
          `[SamAI] Button details - text: "${text}", aria: "${ariaLabel}", title: "${title}"`
        );
        return button;
      }
    }
  }

  console.log(`[SamAI] No button found for: ${buttonDescription}`);
  return null;
};

// Simple auto-enable transcript function
const autoEnableTranscript = async (): Promise<void> => {
  console.log("[SamAI] Auto-enabling transcript (simple approach)...");

  // Step 1: Click the "more" (three dots) button
  const moreButton = await findButtonByText("more options button");

  if (moreButton) {
    try {
      console.log("[SamAI] Clicking more button...");
      moreButton.click();
      console.log("[SamAI] Clicked more button, waiting for menu to appear...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.log(`[SamAI] Could not click more button: ${error}`);
    }
  } else {
    console.log("[SamAI] Could not find more button");
  }

  // Step 2: Click the "show transcript" button
  const transcriptButton = await findButtonByText("show transcript button");

  if (transcriptButton) {
    try {
      console.log("[SamAI] Clicking transcript button...");
      transcriptButton.click();
      console.log(
        "[SamAI] Clicked transcript button, waiting for transcript to load..."
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.log(`[SamAI] Could not click transcript button: ${error}`);
    }
  } else {
    console.log("[SamAI] Could not find transcript button");
  }

  console.log("[SamAI] Simple auto-enable transcript completed");
};

// Video transcript extraction function
const extractVideoTranscript = async (): Promise<string> => {
  try {
    console.log("[SamAI] Attempting to extract video transcript...");

    // Auto-enable transcript first
    await autoEnableTranscript();

    // Enhanced selectors for current YouTube structure
    const transcriptSelectors = [
      // YouTube transcript panel (most likely)
      "#transcript .cues-box .cue-group",
      "#transcript .cues-box .cue",
      "#transcript .cues-box",
      "#transcript .captions-text",
      "#transcript .caption-window",
      // Alternative YouTube selectors
      ".ytp-caption-segment",
      ".caption-window .caption-line",
      "[data-time] .captions-text",
      '[data-time]:not([data-time=""])',
      // Generic video platforms
      ".vp-captions-cue",
      '[class*="transcript"]',
      '[class*="subtitle"]',
      '[class*="caption"]',
      // Video tracks
      "video[tracks]",
    ];

    let transcriptText = "";
    let foundElements = 0;

    for (const selector of transcriptSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(
          `[SamAI] Found ${elements.length} transcript elements with selector: ${selector}`
        );

        // Extract text from all transcript elements
        const texts = Array.from(elements)
          .map((el) => {
            // For elements with timestamps, include the time info
            const timeAttr = el.getAttribute("data-time");
            const text = el.textContent?.trim() || "";
            if (timeAttr && text) {
              return `[${timeAttr}] ${text}`;
            }
            return text;
          })
          .filter((text) => text && text.length > 0);

        if (texts.length > 0) {
          foundElements = texts.length;
          transcriptText = texts.join(" ");
          console.log(
            `[SamAI] Extracted transcript (${texts.length} segments):`,
            transcriptText.substring(0, 200) + "..."
          );
          break;
        }
      }
    }

    // If no transcript found, check if we're on a video page at least
    if (!transcriptText) {
      const videoElements = document.querySelectorAll("video");
      const youtubeIndicators = [
        document.querySelector(
          'meta[property="og:site_name"][content*="YouTube"]'
        ),
        document.querySelector('[data-testid="watch-video"]'),
        document.querySelector("#movie_player"),
        document.querySelector(".html5-video-container"),
      ];

      if (
        videoElements.length > 0 ||
        youtubeIndicators.some((el) => el !== null)
      ) {
        console.log("[SamAI] Found video elements but no transcript");
        transcriptText =
          "This appears to be a YouTube video page, but the transcript/captions are not currently available. " +
          "This could mean:\n" +
          "1. The video doesn't have captions/subtitles available\n" +
          "2. The captions are in a different language than your browser setting\n" +
          "3. The transcript extraction needs more time to load\n\n" +
          "Try manually enabling captions by clicking the CC button on the video player.";
      } else {
        throw new Error(
          "No video page detected. Please make sure you're on a YouTube video, Vimeo, or other video platform page."
        );
      }
    }

    // Validate transcript quality
    if (transcriptText.length < 50 && !transcriptText.includes("captions")) {
      throw new Error(
        "Found transcript content but it's too short to be useful. The video might not have captions enabled or the transcript may not be fully loaded yet."
      );
    }

    return transcriptText;
  } catch (error) {
    console.error("[SamAI] Error extracting video transcript:", error);
    throw error; // Re-throw the specific error message
  }
};

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
  const [activeTab, setActiveTab] = useState<TabId>(
    response ? "chat" : "search"
  );

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
  const [scrapeResultFormat, setScrapeResultFormat] =
    useState<ScrapeResultFormat>("markdown");
  const [scrapedContent, setScrapedContent] = useState<string | null>(null);
  const [scrapeResult, setScrapeResult] = useState<string | null>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside (but not when clicking on modals)
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      // Don't close if clicking on modal or settings panel
      if (target instanceof Element) {
        const isModal = target.closest(".samai-modal, .search-settings-panel");
        if (isModal) return;
      }

      if (panelRef.current && !panelRef.current.contains(target)) {
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

  // Auto-trigger summary when "Sum" tab is opened
  React.useEffect(() => {
    if (activeTab === "sum" && !summary && !isSummarizing && !summaryError) {
      console.log("[SamAI] Auto-triggering summary for Sum tab...");
      handleSummarize();
    }
  }, [activeTab]);

  const SCRAPE_RESULT_PROMPTS: Record<
    ScrapeResultFormat,
    { guidance: string; extension: string }
  > = {
    markdown: {
      guidance:
        "Respond with well-structured GitHub-flavored Markdown using headings, bullet lists and bold labels where appropriate.",
      extension: "md",
    },
    json: {
      guidance:
        "Respond with valid, minified JSON. Use arrays for collections and include descriptive property names. Do not include explanations outside the JSON.",
      extension: "json",
    },
    table: {
      guidance:
        "Respond with a Markdown table. Include a header row and ensure each row is aligned with the headers. Use concise columns.",
      extension: "md",
    },
    plain: {
      guidance:
        "Respond with clean plain text paragraphs or numbered/bullet lists. Avoid markdown decorations unless necessary for readability.",
      extension: "txt",
    },
  };

  // Handlers
  const handleScrape = async () => {
    if (!isApiKeySet) {
      setScrapeError(
        "Please configure your API key before running the scraper."
      );
      return;
    }
    if (!scrapeInstructions.trim()) {
      setScrapeError("Describe what you'd like SamAI to extract first.");
      return;
    }
    setIsScraping(true);
    setScrapeError(null);
    setScrapeResult(null);
    try {
      const sourceContent = await getPageContent(scrapeMode, true);
      setScrapedContent(sourceContent);

      const truncatedContent =
        sourceContent.length > 15000
          ? `${sourceContent.slice(0, 15000)}\n[Truncated for prompt length]`
          : sourceContent;

      const formatGuidance = SCRAPE_RESULT_PROMPTS[scrapeResultFormat].guidance;
      const contentLabel =
        scrapeMode === "html" ? "Optimized HTML" : "Visible text content";

      const prompt = `You are SamAI, an expert web scraper embedded inside the browser. 
Follow the user's extraction request carefully and use ONLY the provided page data. 
Format requirements: ${formatGuidance}

Extraction request:
${scrapeInstructions.trim()}

${contentLabel} (freshly captured):
${truncatedContent}`;

      const extraction = await generateFormResponse(prompt);
      if (!extraction) {
        throw new Error(
          "No extracted data was returned. Please refine the instructions."
        );
      }
      setScrapeResult(extraction.trim());
    } catch (error) {
      console.error("Error scraping page:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while scraping.";
      setScrapeError(message);
      setScrapeResult(null);
    } finally {
      setIsScraping(false);
    }
  };

  const handleOpenScrapedChat = async () => {
    const payload = scrapeResult ?? scrapedContent;
    if (!payload) return;
    setActiveTab("chat");
  };

  const handleDownloadScraped = () => {
    const payload = scrapeResult ?? scrapedContent;
    if (!payload) return;
    const extension = scrapeResult
      ? SCRAPE_RESULT_PROMPTS[scrapeResultFormat].extension
      : scrapeMode === "html"
      ? "html"
      : "txt";
    const mimeType =
      extension === "html"
        ? "text/html"
        : extension === "json"
        ? "application/json"
        : "text/plain;charset=utf-8";
    const blob = new Blob([payload], {
      type: mimeType,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scraped-page-${new Date()
      .toISOString()
      .slice(0, 10)}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleForm = () => {
    setActiveTab("form");
  };

  const handleImage = () => {
    window.open(
      "https://aistudio.google.com/prompts/new_chat?model=gemini-2.5-flash-image&utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=",
      "_blank"
    );
  };

  const handleChat = async () => {
    try {
      setActiveTab("chat");
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
      console.log(
        "[SamAI] Starting fresh page content extraction for summary..."
      );
      // Always extract fresh content from current page for summarization
      const content = await getPageContent(outputFormat, true);
      console.log(
        "[SamAI] Fresh page content extracted, length:",
        content.length
      );
      console.log("[SamAI] Current page URL:", window.location.href);

      if (!content || content.trim().length === 0) {
        throw new Error(
          "No readable content found on this page. The page might be empty, protected, or not fully loaded."
        );
      }

      // Show a preview of the content being summarized for debugging
      const contentPreview =
        content.length > 200 ? content.substring(0, 200) + "..." : content;
      console.log("[SamAI] Content preview:", contentPreview);

      const prompt = `Please provide a comprehensive summary of the following content. Focus on the main points, key information, and important details. Structure your summary with clear sections and bullet points where appropriate.

Page URL: ${window.location.href}
Page Title: ${document.title}

Content to summarize:
${content}`;

      console.log("[SamAI] Generating AI summary...");
      const summaryText = await generateFormResponse(prompt);
      console.log(
        "[SamAI] AI summary generated, length:",
        summaryText?.length || 0
      );

      if (!summaryText || summaryText.trim().length === 0) {
        throw new Error(
          "No summary received from AI. Please check your API key configuration and try again."
        );
      }
      setSummary(summaryText);
    } catch (error) {
      console.error("[SamAI] Error in handleSummarize:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to summarize page";
      setSummaryError(errorMessage);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSendChatMessage = async (
    e: React.FormEvent,
    source?: ChatSource,
    enhancedContext?: string
  ) => {
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
      let fullPrompt = enhancedContext || chatInput;

      // **CRITICAL**: Always extract fresh content for page-related queries
      if (
        source === "page" ||
        source === "html" ||
        source === "video" ||
        !source
      ) {
        setIsExtractingContent(true);

        let currentPageContent = "";
        let contentLabel = "";

        if (source === "video") {
          // Extract video transcript
          try {
            console.log("[SamAI] Extracting video transcript...");
            currentPageContent = await extractVideoTranscript();
            contentLabel = "video transcript";
          } catch (error) {
            console.error("[SamAI] Error extracting video transcript:", error);
            // Fallback to regular page content
            currentPageContent = await getPageContent(outputFormat, true);
            contentLabel = "page content (video transcript extraction failed)";
          }
        } else {
          // Regular page content extraction
          currentPageContent = await getPageContent(
            source === "html" ? "html" : outputFormat,
            true // Force fresh extraction
          );
          contentLabel = source === "html" ? "HTML structure" : "visible text";
        }

        setIsExtractingContent(false);

        fullPrompt = `${chatInput}

CURRENT PAGE CONTENT (freshly extracted from the ${contentLabel} of the page you're currently viewing - URL: ${window.location.href}):
${currentPageContent}

Please provide a helpful response about the user's question specifically related to the current page content above. Focus on what's actually on this page: ${window.location.href}`;
      } else if (source === "none") {
        // Just use the raw question without page context
        fullPrompt = chatInput;
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

  const handleClearScrapePreview = () => {
    setScrapedContent(null);
    setScrapeResult(null);
    setScrapeError(null);
  };

  const handleOpenApiKey = () => {
    browser.runtime.sendMessage({ type: "openApiKeyPage" });
  };

  const handleOpenSearchSettings = () => {
    browser.runtime.sendMessage({ type: "openSearchSettingsPage" });
  };

  return (
    <>
      <div
        ref={panelRef}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          maxHeight: "100vh",
          padding: "0.25rem",
          overflow: "hidden",
          boxSizing: "border-box",
          animation: "samai-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div style={{ flexShrink: 0, marginBottom: "0.5rem" }}>
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onChatClick={handleChat}
            onSummarizeClick={handleSummarize}
            onFormClick={handleForm}
            onImageClick={handleImage}
          />
        </div>

        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {activeTab === "search" && (
            <div style={{ flex: 1, overflowY: "auto" }}>
              <SearchTab
                response={response}
                isApiKeySet={isApiKeySet}
                outputFormat={outputFormat}
                onOpenSettings={handleOpenSearchSettings}
              />
            </div>
          )}

          {activeTab === "scrape" && (
            <div style={{ flex: 1, overflowY: "auto" }}>
              <ScrapeTab
                isScraping={isScraping}
                scrapeMode={scrapeMode}
                onScrapeModeChange={setScrapeMode}
                scrapeInstructions={scrapeInstructions}
                onScrapeInstructionsChange={setScrapeInstructions}
                scrapeResultFormat={scrapeResultFormat}
                onScrapeResultFormatChange={setScrapeResultFormat}
                scrapeResult={scrapeResult}
                scrapeError={scrapeError}
                scrapedContent={scrapedContent}
                onScrape={handleScrape}
                onOpenChat={handleOpenScrapedChat}
                onDownload={handleDownloadScraped}
                onClearPreview={handleClearScrapePreview}
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
              outputFormat={outputFormat}
              messagesEndRef={messagesEndRef}
              onInputChange={setChatInput}
              onSubmit={handleSendChatMessage}
              onOpenApiKey={handleOpenApiKey}
            />
          )}

          {activeTab === "sum" && (
            <div style={{ flex: 1, overflowY: "auto" }}>
              <SummaryTab
                isSummarizing={isSummarizing}
                summary={summary}
                summaryError={summaryError}
                onSummarize={handleSummarize}
              />
            </div>
          )}

          {activeTab === "form" && (
            <div style={{ flex: 1, overflowY: "auto" }}>
              <FormTab onFormClick={handleForm} />
            </div>
          )}

          {activeTab === "image" && (
            <div style={{ flex: 1, overflowY: "auto" }}>
              <ImageTab onImageClick={handleImage} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
