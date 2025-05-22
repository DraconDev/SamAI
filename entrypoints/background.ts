import { generateFormResponse } from "@/utils/ai/gemini";
import type { Runtime } from "wxt/browser";

// Define message types
interface BaseMessage {
  type: string;
}

interface GenerateGeminiResponseRequest extends BaseMessage {
  type: "generateGeminiResponse";
  prompt: string;
}

interface OpenApiKeyPageRequest extends BaseMessage {
  type: "openApiKeyPage";
}

interface SetInputValueRequest extends BaseMessage {
  type: "setInputValue";
  value: string;
}

interface ClearInputElementMessage extends BaseMessage {
  type: "clearInputElement";
}

import { OutputFormat } from "@/utils/page-content"; // Import OutputFormat
import { InputElementClickedMessage } from "@/entrypoints/content"; // Import InputElementClickedMessage

interface GetPageContentRequest extends BaseMessage {
  type: "getPageContent";
  outputFormat: OutputFormat; // Add outputFormat
}

interface PageContentResponseMessage extends BaseMessage {
  type: "pageContentResponse";
  content: string;
  outputFormat: OutputFormat; // Add outputFormat
  error?: string; // Optional error message
}

type BackgroundMessage =
  | GenerateGeminiResponseRequest
  | OpenApiKeyPageRequest
  | SetInputValueRequest
  | GetPageContentRequest
  | PageContentResponseMessage
  | InputElementClickedMessage
  | ClearInputElementMessage; // Add new message type

// Type guard for incoming messages
function isBackgroundMessage(message: any): message is BackgroundMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    "type" in message &&
    typeof message.type === "string"
  );
}

export default defineBackground(() => {
  let sourceTabId: number | null = null;

  // Create context menu item
  browser.contextMenus.create({
    id: "samai-context-menu",
    title: "Sam",
    contexts: ["all"],
  });

  // Listen for runtime messages
  browser.runtime.onMessage.addListener(
    async (
      // Marked as async to allow await expressions
      message: unknown,
      sender: Runtime.MessageSender,
      sendResponse: (response?: any) => void
    ): Promise<true | undefined> => {
      // Corrected return type
      console.log("[SamAI Background] Listener received message:", message); // More specific log

      if (!isBackgroundMessage(message)) {
        console.warn(
          "[SamAI Background] Received message with invalid structure:",
          message
        );
        return undefined; // Explicitly return undefined for invalid structure
      }

      switch (message.type) {
        case "generateGeminiResponse": {
          console.log("[SamAI Background] Handling generateGeminiResponse message."); // NEW LOG
          const geminiMessage = message as GenerateGeminiResponseRequest; // Assert after type guard
          console.log(
            "[SamAI Background] Attempting to generate Gemini response"
          );

          // Check if sender is a valid tab
          if (!sender.tab) {
            console.error("[SamAI Background] No sender tab found");
            sendResponse(null);
            return true; // Will respond asynchronously
          }

          try {
            console.log("[SamAI Background] Calling generateFormResponse with prompt:", geminiMessage.prompt);
            const textPromise = generateFormResponse(geminiMessage.prompt);
            console.log("[SamAI Background] Returning promise from generateFormResponse.");
            return textPromise; // Directly return the promise
          } catch (error: unknown) { // Explicitly type error as unknown
            const err = error as Error; // Cast to Error for property access
            console.error("[SamAI Background] Error generating response:", {
              message: err.message,
              stack: err.stack,
            });
            return Promise.resolve(null); // Return a resolved promise with null on error
          }
        }

        case "openApiKeyPage":
          console.log(
            "[SamAI Background] Received request to open API key page"
          );
          browser.tabs.create({ url: "apikey.html" });
          return undefined; // Handled synchronously, no response needed

        case "setInputValue": {
          const setInputMessage = message as SetInputValueRequest; // Assert after type guard
          if (sourceTabId) {
            // Handle setInputValue asynchronously
            browser.tabs
              .sendMessage(sourceTabId, setInputMessage)
              .then((result) => {
                sendResponse(result);
              })
              .catch((error) => {
                console.error("Error forwarding message:", error);
                sendResponse({
                  success: false,
                  error: "Failed to forward message to content script",
                });
              });
            return true; // Will respond asynchronously
          } else {
            console.warn(
              "[SamAI Background] Received setInputValue message but sourceTabId is null"
            );
            sendResponse({ success: false, error: "Source tab not available" });
            return true; // Will respond asynchronously
          }
        }

        case "getPageContent":
          // This message is typically handled by the content script, not the background.
          // If it reaches here, it might be an unexpected message or a misconfiguration.
          console.warn(
            "[SamAI Background] Received unexpected getPageContent message in background"
          );
          return undefined; // Not handled synchronously

        case "pageContentResponse": {
          const pageContentMessage = message as PageContentResponseMessage;
          console.log(
            "[SamAI Background] Received pageContentResponse for format:",
            pageContentMessage.outputFormat,
            "Content length:",
            pageContentMessage.content.length
          );
          if (pageContentMessage.error) {
            console.error(
              "[SamAI Background] Error from content script:",
              pageContentMessage.error
            );
          }
          // Store content based on its format
          if (pageContentMessage.outputFormat === "text") {
            await browser.storage.local.set({
              pageBodyText:
                pageContentMessage.content || "Unable to access page content",
            });
          } else if (pageContentMessage.outputFormat === "html") {
            await browser.storage.local.set({
              pageOptimizedHtml:
                pageContentMessage.content || "Unable to access page content",
            });
          }
          return undefined; // Handled asynchronously, no direct response to this message
        }

        case "clearInputElement":
          console.log("[SamAI Background] Received clearInputElement message, removing inputInfo from storage.");
          await browser.storage.local.remove("inputInfo");
          return undefined; // Handled asynchronously

        default:
          // If message.type is a string but not one of the known types
          console.warn("[SamAI Background] Received unknown message:", message); // Log the whole message
          return undefined; // Explicitly return undefined for unknown message types
      }
    }
  );

  // Add click handler for the context menu item
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id) return;

    // Store the source tab ID
    sourceTabId = tab.id;

    try {
      console.log("Content script registered in tab:", tab.id);

      // Send messages to content script to get both text and HTML content
      const getBodyTextMessage: GetPageContentRequest = {
        type: "getPageContent",
        outputFormat: "text",
      };
      browser.tabs.sendMessage(tab.id, getBodyTextMessage).catch((error) => {
        console.error(
          "[SamAI Background] Error sending getPageContent (text) message:",
          error
        );
      });
      console.log(
        "[SamAI Background] Sent getPageContent (text) message to tab:",
        tab.id
      );

      const getOptimizedHtmlMessage: GetPageContentRequest = {
        type: "getPageContent",
        outputFormat: "html",
      };
      browser.tabs
        .sendMessage(tab.id, getOptimizedHtmlMessage)
        .catch((error) => {
          console.error(
            "[SamAI Background] Error sending getPageContent (html) message:",
            error
          );
        });
      console.log(
        "[SamAI Background] Sent getPageContent (html) message to tab:",
        tab.id
      );

      // Open popup
      browser.windows.create({
        url: browser.runtime.getURL("/context-popup.html"),
        type: "popup",
        width: 400,
        height: 350,
      });
    } catch (error) {
      console.error("Error in background script:", error);
      // If there's an error, still open the popup, but it might not have inputInfo
      browser.windows.create({
        url: browser.runtime.getURL("/context-popup.html"),
        type: "popup",
        width: 400,
        height: 350,
      });
    }
  });

  // Add new case for inputElementClicked
  browser.runtime.onMessage.addListener(async (message: unknown) => {
    if (
      typeof message === "object" &&
      message !== null &&
      "type" in message &&
      message.type === "inputElementClicked"
    ) {
      const inputElementClickedMsg = message as InputElementClickedMessage;
      console.log("[SamAI Background] Received inputElementClicked message:", inputElementClickedMsg);
      await browser.storage.local.set({ inputInfo: inputElementClickedMsg.inputInfo });
      console.log("[SamAI Background] inputInfo stored from inputElementClicked.");
    }
  });

  // Clear source tab ID when the tab is closed
  browser.tabs.onRemoved.addListener((tabId) => {
    if (tabId === sourceTabId) {
      sourceTabId = null;
    }
  });
});
