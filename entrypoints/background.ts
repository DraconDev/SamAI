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

interface GetInputInfoRequest extends BaseMessage {
  type: "getInputInfo";
}

interface GetPageContentRequest extends BaseMessage {
  type: "getPageContent";
}

interface PageContentResponseMessage extends BaseMessage {
  type: "pageContentResponse";
  content: string;
  error?: string; // Optional error message
}

interface InputInfoResponse {
  messageType: "inputInfo";
  value?: string;
  placeholder?: string;
  inputType?: string;
  id?: string;
  name?: string;
}

type BackgroundMessage =
  | GenerateGeminiResponseRequest
  | OpenApiKeyPageRequest
  | SetInputValueRequest
  | GetInputInfoRequest
  | GetPageContentRequest
  | PageContentResponseMessage; // Add new type

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
    async ( // Marked as async to allow await expressions
      message: unknown,
      sender: Runtime.MessageSender,
      sendResponse: (response?: any) => void
    ): Promise<true | undefined> => { // Corrected return type
      console.log("[SamAI Background] Received message:", message);

      if (!isBackgroundMessage(message)) {
        console.warn(
          "[SamAI Background] Received message with invalid structure:",
          message
        );
        return undefined; // Explicitly return undefined for invalid structure
      }

      switch (message.type) {
        case "generateGeminiResponse": {
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

          generateFormResponse(geminiMessage.prompt)
            .then((text) => {
              if (text === null) {
                console.error(
                  "[SamAI Background] Response generation failed - null response"
                );
              } else {
                console.log(
                  "[SamAI Background] Successfully generated response"
                );
              }
              console.log("[SamAI Background] Response text:", text);
              sendResponse(text);
            })
            .catch((error) => {
              console.error("[SamAI Background] Error generating response:", {
                message: error.message,
                stack: error.stack,
              });
              sendResponse(null);
            });
          return true; // Will respond asynchronously
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

        case "getInputInfo":
          // This message is typically handled by the content script, not the background.
          // If it reaches here, it might be an unexpected message or a misconfiguration.
          console.warn(
            "[SamAI Background] Received unexpected getInputInfo message in background"
          );
          return undefined; // Not handled synchronously

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
            "[SamAI Background] Received pageContentResponse. Content length:",
            pageContentMessage.content.length
          );
          if (pageContentMessage.error) {
            console.error(
              "[SamAI Background] Error from content script:",
              pageContentMessage.error
            );
          }
          await browser.storage.local.set({
            pageContent: pageContentMessage.content || "Unable to access page content",
          });
          return undefined; // Handled asynchronously, no direct response to this message
        }

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

      // Try to get input information if it's an input element
      const getInputMessage: GetInputInfoRequest = { type: "getInputInfo" };
      console.log("Sending message to content script:", getInputMessage);

      const inputResponse = await browser.tabs.sendMessage(
        tab.id,
        getInputMessage
      );
      console.log("Background received input response:", inputResponse);

      // Store input info in local storage
      if (
        inputResponse &&
        typeof inputResponse === "object" &&
        "messageType" in inputResponse &&
        (inputResponse as InputInfoResponse).messageType === "inputInfo"
      ) {
        console.log("Input info received:", inputResponse);
        const typedInputResponse = inputResponse as InputInfoResponse;
        await browser.storage.local.set({
          inputInfo: {
            value: typedInputResponse.value || "",
            placeholder: typedInputResponse.placeholder || "",
            inputType: typedInputResponse.inputType || "",
            elementId: typedInputResponse.id || "",
            elementName: typedInputResponse.name || "",
          },
        });
      } else {
        await browser.storage.local.remove("inputInfo");
      }

      // Send message to content script to get page content (no await here)
      const getPageContentMessage: GetPageContentRequest = {
        type: "getPageContent",
      };
      browser.tabs.sendMessage(tab.id, getPageContentMessage).catch((error) => {
        console.error("[SamAI Background] Error sending getPageContent message:", error);
      });
      console.log("[SamAI Background] Sent getPageContent message to tab:", tab.id);

      // Ensure inputInfo is cleared, as this context menu action is for page summarization
      // This line is now redundant as it's handled above, but keeping it for now to match the original structure
      await browser.storage.local.remove("inputInfo");

      // Open popup
      browser.windows.create({
        url: browser.runtime.getURL("/context-popup.html"),
        type: "popup",
        width: 400,
        height: 350,
      });
    } catch (error) {
      console.error("Error in background script:", error);
      // If there's an error getting page content, still open the popup,
      // but it will indicate "Unable to access page content"
      browser.windows.create({
        url: browser.runtime.getURL("/context-popup.html"),
        type: "popup",
        width: 400,
        height: 350,
      });
    }
  });

  // Clear source tab ID when the tab is closed
  browser.tabs.onRemoved.addListener((tabId) => {
    if (tabId === sourceTabId) {
      sourceTabId = null;
    }
  });
});
