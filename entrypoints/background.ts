import { routeMessage, isBackgroundMessage } from "@/utils/background/messageHandlers";
import { generateFormResponse } from "@/utils/ai/gemini";
import type { Runtime } from "wxt/browser";
import { InputElementClickedMessage } from "@/entrypoints/content"; // Import InputElementClickedMessage
import { OutputFormat } from "@/utils/page-content"; // Import OutputFormat

interface GetPageContentRequest {
  type: "getPageContent";
  outputFormat: OutputFormat; // Add outputFormat
}

interface GetSummaryContentRequest {
  type: "getSummaryContent";
}

interface SummaryContentResponse {
  type: "summaryContent";
  content: string;
}

export default defineBackground(() => {
  let sourceTabId: number | null = null;
  let contextPopupWindowId: number | null = null; // Track the context popup window

  // Create context menu items for Input Assistant only
  browser.contextMenus.create({
    id: "samai-input-assistant",
    title: "Sam Input Assistant",
    contexts: ["editable"],
  });

  // Listen for runtime messages
  browser.runtime.onMessage.addListener(
    async (
      // Marked as async to allow await expressions
      message: unknown,
      sender: Runtime.MessageSender,
      sendResponse: (response?: any) => void
    ): Promise<string | null | boolean | undefined> => {
      // Corrected return type to allow string, null, boolean, or undefined
      console.log("[SamAI Background] Listener received message:", message); // More specific log

      if (!isBackgroundMessage(message)) {
        console.warn(
          "[SamAI Background] Received message with invalid structure:",
          message
        );
        return undefined; // Explicitly return undefined for invalid structure
      }

      // Use the message router
      return routeMessage(message, sender, sendResponse, sourceTabId);
    }
  );

  // Add click handler for the context menu item
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id) return;

    // Store the source tab ID
    sourceTabId = tab.id;

    try {
      console.log("Input Assistant clicked in tab:", tab.id);

      // Close existing popup if open
      if (contextPopupWindowId !== null) {
        try {
          await browser.windows.remove(contextPopupWindowId);
          contextPopupWindowId = null;
        } catch (error) {
          // Window might already be closed, ignore error
          console.log("[SamAI Background] Previous popup already closed");
          contextPopupWindowId = null;
        }
      }

      // Open popup and store window ID
      const popupWindow = await browser.windows.create({
        url: browser.runtime.getURL("/context-popup.html"),
        type: "popup",
        width: 864,
        height: 780,
      });
      contextPopupWindowId = popupWindow.id || null;
    } catch (error) {
      console.error("Error in background script:", error);
      // Close existing popup if open
      if (contextPopupWindowId !== null) {
        try {
          await browser.windows.remove(contextPopupWindowId);
          contextPopupWindowId = null;
        } catch (error) {
          // Window might already be closed, ignore error
          console.log("[SamAI Background] Previous popup already closed");
          contextPopupWindowId = null;
        }
      }

      // If there's an error, still open the popup, but it might not have inputInfo
      const popupWindow = await browser.windows.create({
        url: browser.runtime.getURL("/context-popup.html"),
        type: "popup",
        width: 864,
        height: 780,
      });
      contextPopupWindowId = popupWindow.id || null;
    }
  });

  // Clear source tab ID when the tab is closed
  browser.tabs.onRemoved.addListener((tabId) => {
    if (tabId === sourceTabId) {
      sourceTabId = null;
    }
  });

  // Clear popup window ID when the window is closed
  browser.windows.onRemoved.addListener((windowId) => {
    if (windowId === contextPopupWindowId) {
      contextPopupWindowId = null;
    }
  });
});