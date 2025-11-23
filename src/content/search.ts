import { searchSettingsStore } from "@/utils/store"; // Import searchSettingsStore
import React from "react";
import { createRoot, type Root } from "react-dom/client"; // Import Root type
import SearchPanel from "./SearchPanel";
import { extractPageContent } from "@/utils/page-content";

let samaiRoot: Root | null = null; // Module-scoped root
let samaiPanelContainer: HTMLDivElement | null = null; // Module-scoped container

function injectStyles() {
  const styleTag = document.createElement("style");
  styleTag.id = "samai-styles";
  styleTag.textContent = `
    /* Reset container styles */
    #samai-container {
      all: initial;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #e2e8f0;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Markdown styles */
    #samai-container pre {
      background: #1a1b2e;
      border: 1px solid rgba(46, 47, 62, 0.5);
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 1rem 0;
      overflow-x: auto;
    }

    #samai-container code {
      font-family: 'Fira Code', monospace;
      font-size: 0.9em;
      background: rgba(46, 47, 62, 0.5);
      padding: 0.2em 0.4em;
      border-radius: 0.25rem;
    }

    #samai-container p {
      margin: 1em 0;
      line-height: 1.7;
    }

    #samai-container h1, #samai-container h2, #samai-container h3 {
      font-weight: 600;
      margin: 1.5em 0 0.5em;
      color: #e2e8f0;
    }

    #samai-container ul, #samai-container ol {
      margin: 1em 0;
      padding-left: 1.5em;
      list-style-type: disc;
    }

    #samai-container ol {
      list-style-type: decimal;
    }

    #samai-container li {
      margin: 0.5em 0;
    }

    #samai-container a {
      color: #818cf8;
      text-decoration: underline;
    }

    #samai-container a:hover {
      color: #4f46e5;
    }

    #samai-container strong {
      color: #818cf8;
      font-weight: 600;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    @keyframes slideOut {
      from { transform: translateX(0); }
      to { transform: translateX(100%); }
    }

    .animate-slide-in {
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .animate-slide-out {
      animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }

    .animate-spin {
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleTag);
}

// Function to summarize the current page
async function summarizeCurrentPage(): Promise<string | null> {
  try {
    console.log("[SamAI] Starting page summarization");
    
    // Extract page content
    const pageContent = extractPageContent("text");
    if (!pageContent || pageContent.trim().length === 0) {
      console.warn("[SamAI] No content extracted from page");
      return "No readable content found on this page.";
    }

    console.log("[SamAI] Extracted content length:", pageContent.length);

    // Create summarization prompt
    const summarizePrompt = `Please provide a concise summary of the following webpage content. Focus on the main points, key information, and important details. Keep it informative but brief (2-3 paragraphs max):

Page URL: ${window.location.href}

Content:
${pageContent.substring(0, 4000)}...`; // Limit content to avoid token limits

    // Send message to background script to get AI response
    const response = await browser.runtime.sendMessage({
      type: "generateGeminiResponse",
      prompt: summarizePrompt,
    });

    let aiResponseText = response as string;
    try {
      const parsed = JSON.parse(aiResponseText);
      if (parsed && parsed.responseText) {
        aiResponseText = parsed.responseText;
      }
    } catch (e) {
      // If parsing fails, assume it's already plain text
      console.log("[SamAI] Response is not JSON, using as is");
    }

    return aiResponseText || "Unable to generate summary.";
  } catch (error) {
    console.error("[SamAI] Error generating summary:", error);
    return "Sorry, I encountered an error while generating the summary. Please try again.";
  }
}

export async function showSidePanel(
  response: string | null,
  toggleIfOpen: boolean = false
) {
  // If toggle is requested and panel exists, close it and return
  if (toggleIfOpen && samaiPanelContainer) {
    if (samaiRoot) {
      samaiRoot.unmount();
      samaiRoot = null;
    }
    if (samaiPanelContainer) {
      samaiPanelContainer.remove();
      samaiPanelContainer = null;
    }
    return;
  }

  // Create the summarize handler
  const handleSummarize = async () => {
    console.log("[SamAI] Summarize button clicked");
    
    // Update the panel to show loading state
    if (samaiRoot && samaiPanelContainer) {
      samaiRoot.render(
        React.createElement(SearchPanel, {
          response: "Generating summary...",
          outputFormat: "text",
          onClose: () => {
            if (samaiRoot) {
              samaiRoot.unmount();
              samaiRoot = null;
            }
            if (samaiPanelContainer) {
              samaiPanelContainer.remove();
              samaiPanelContainer = null;
            }
          },
          onSummarize: handleSummarize,
        })
      );
    }

    try {
      // Generate summary
      const summary = await summarizeCurrentPage();
      
      // Update the panel with the summary
      if (samaiRoot && samaiPanelContainer) {
        samaiRoot.render(
          React.createElement(SearchPanel, {
            response: summary,
            outputFormat: "text",
            onClose: () => {
              if (samaiRoot) {
                samaiRoot.unmount();
                samaiRoot = null;
              }
              if (samaiPanelContainer) {
                samaiPanelContainer.remove();
                samaiPanelContainer = null;
              }
            },
            onSummarize: handleSummarize,
          })
        );
      }
    } catch (error) {
      console.error("[SamAI] Error in summarize handler:", error);
      
      // Show error in the panel
      if (samaiRoot && samaiPanelContainer) {
        samaiRoot.render(
          React.createElement(SearchPanel, {
            response: "Sorry, there was an error generating the summary. Please try again.",
            outputFormat: "text",
            onClose: () => {
              if (samaiRoot) {
                samaiRoot.unmount();
                samaiRoot = null;
              }
              if (samaiPanelContainer) {
                samaiPanelContainer.remove();
                samaiPanelContainer = null;
              }
            },
            onSummarize: handleSummarize,
          })
        );
      }
    }
  };

  // If panel already exists, just update the content and add summarize handler
  if (samaiRoot && samaiPanelContainer) {
    const settings = await searchSettingsStore.getValue();
    const outputFormat = settings.outputFormat;
    samaiRoot.render(
      React.createElement(SearchPanel, {
        response,
        outputFormat,
        onClose: () => {
          if (samaiRoot) {
            samaiRoot.unmount();
            samaiRoot = null;
          }
          if (samaiPanelContainer) {
            samaiPanelContainer.remove();
            samaiPanelContainer = null;
          }
        },
        onSummarize: handleSummarize,
      })
    );
    return;
  }

  // Create new panel container
  samaiPanelContainer = document.createElement("div");
  samaiPanelContainer.id = "samai-container";
  document.body.appendChild(samaiPanelContainer);

  // Inject styles if not already present
  if (!document.querySelector("#samai-styles")) {
    injectStyles();
  }

  // Initialize React root
  samaiRoot = createRoot(samaiPanelContainer);

  // Get current output format from store
  const settings = await searchSettingsStore.getValue();
  const outputFormat = settings.outputFormat;

  // Render the SearchPanel with a close handler and summarize handler
  if (samaiRoot) {
    samaiRoot.render(
      React.createElement(SearchPanel, {
        response,
        outputFormat,
        onClose: () => {
          // Cleanup React root and container
          if (samaiRoot) {
            samaiRoot.unmount();
            samaiRoot = null;
          }
          if (samaiPanelContainer) {
            samaiPanelContainer.remove();
            samaiPanelContainer = null;
          }
        },
        onSummarize: handleSummarize,
      })
    );
  }
}
