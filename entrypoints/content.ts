import { initializeGoogleSearch } from "@/src/content/google-search";
import { showSidePanel } from "@/src/content/search";
import { extractPageContent } from "@/utils/page-content";
import { searchSettingsStore } from "@/utils/store";
import { tabs } from "webextension-polyfill";
import { OutputFormat } from "@/utils/page-content"; // Import OutputFormat

// Define message types
interface GetPageContentMessage {
  type: "getPageContent";
  outputFormat: OutputFormat; // Add outputFormat
}

interface GetInputInfoMessage {
  type: "getInputInfo";
}

interface SetInputValueMessage {
  type: "setInputValue";
  value: string;
}

interface ShowSummaryMessage {
  type: "showSummary";
  summary: string;
}

// Define new message type for response
interface PageContentResponseMessage {
  type: "pageContentResponse";
  content: string;
  outputFormat: OutputFormat; // Add outputFormat
  error?: string; // Optional error message
}

type ContentScriptMessage =
  | GetPageContentMessage
  | GetInputInfoMessage
  | SetInputValueMessage
  | ShowSummaryMessage
  | PageContentResponseMessage; // Add new type

export default defineContentScript({
  matches: ["http://*/*", "https://*/*"], // Exclude chrome-extension:// URLs
  main() {
    let lastInputElement: HTMLInputElement | HTMLTextAreaElement | null = null;

    // Debug logging for Google search initialization
    console.log("[SamAI] Content script loaded", {
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      search: window.location.search,
    });
    console.log(
      "[SamAI] document.body.innerText length on load:",
      document.body.innerText.length
    ); // NEW LOG

    // Initialize Google search functionality if we're on a search page with a query
    if (
      window.location.hostname === "www.google.com" &&
      window.location.pathname === "/search" &&
      new URLSearchParams(window.location.search).has("q")
    ) {
      console.log("[SamAI] Initializing Google search functionality");
      // Delay initialization slightly to avoid blocking page load
      setTimeout(() => {
        console.log("[SamAI] Running delayed initialization");
        initializeGoogleSearch();
      }, 500);
    } else {
      console.log("[SamAI] Not initializing - conditions not met");
    }

    // Track input element on clicks
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        lastInputElement = target;
        console.log("[SamAI Content] Input element clicked:", lastInputElement);
      } else {
        lastInputElement = null;
        console.log("[SamAI Content] Clicked outside input, lastInputElement cleared.");
      }
    });

    // Handle messages from the background script
    browser.runtime.onMessage.addListener(
      async (message, sender, sendResponse) => {
        // Made the listener async
        console.log("[SamAI Content] Received message:", message);

        // Use type guards to handle different message types
        if (
          typeof message !== "object" ||
          message === null ||
          !("type" in message)
        ) {
          console.warn(
            "[SamAI Content] Received message with invalid structure:",
            message
          );
          // No sendResponse here, as it's not a direct response to a specific message type
          return; // Indicate that the message was not handled (implicitly returns undefined)
        }

        switch (message.type) {
          case "getPageContent":
            // Assert message type for getPageContent
            const getPageContentMsg = message as GetPageContentMessage;
            console.log("[SamAI Content] Handling getPageContent message with format:", getPageContentMsg.outputFormat);
            try {
              const pageContent = extractPageContent(getPageContentMsg.outputFormat);
              console.log(
                "[SamAI Content] extractPageContent finished, sending response via new message"
              );
              browser.runtime.sendMessage({
                type: "pageContentResponse",
                content: pageContent,
                outputFormat: getPageContentMsg.outputFormat, // Include outputFormat in response
              });
            } catch (error) {
              console.error(
                "[SamAI Content] Error extracting page content:",
                error
              );
              browser.runtime.sendMessage({
                type: "pageContentResponse",
                content: "",
                outputFormat: getPageContentMsg.outputFormat, // Include outputFormat in response even on error
                error: error instanceof Error ? error.message : "Unknown error",
              });
            }
            return;

          case "getInputInfo":
            if (lastInputElement) {
              console.log("[SamAI Content] Handling getInputInfo message");
              const response = {
                messageType: "inputInfo",
                value: lastInputElement.value,
                placeholder: lastInputElement.placeholder,
                id: lastInputElement.id,
                name: lastInputElement.name,
                inputType:
                  lastInputElement instanceof HTMLInputElement
                    ? lastInputElement.type
                    : "textarea",
              };
              console.log("[SamAI Content] Sending input info:", response);
              sendResponse(response);
            } else {
              console.log("[SamAI Content] No input element for getInputInfo");
              sendResponse(false);
            }
            return true; // Will respond asynchronously

          case "setInputValue":
            // Assert message type for setInputValue
            const setInputMessage = message as SetInputValueMessage;
            if (lastInputElement && typeof setInputMessage.value === "string") {
              console.log("[SamAI Content] Handling setInputValue message");
              try {
                lastInputElement.value = setInputMessage.value;
                lastInputElement.dispatchEvent(
                  new Event("input", { bubbles: true })
                );
                lastInputElement.dispatchEvent(
                  new Event("change", { bubbles: true })
                );
                console.log(
                  "[SamAI Content] Updated input value:",
                  setInputMessage.value
                );
                sendResponse({ success: true });
              } catch (error: unknown) {
                console.error(
                  "[SamAI Content] Error setting input value:",
                  error
                );
                const errorMessage =
                  error instanceof Error ? error.message : "Unknown error";
                sendResponse({ success: false, error: errorMessage });
              }
            } else {
              console.log(
                "[SamAI Content] Invalid setInputValue message or no input element"
              );
              sendResponse({
                success: false,
                error: "Invalid message or no input element",
              });
            }
            return true; // Will respond asynchronously

          case "showSummary":
            // Assert message type for showSummary
            const showSummaryMessage = message as ShowSummaryMessage;
            if (typeof showSummaryMessage.summary === "string") {
              console.log("[SamAI Content] Handling showSummary message");
              showSidePanel(showSummaryMessage.summary);
              sendResponse(true);
            } else {
              console.log("[SamAI Content] Invalid showSummary message");
              sendResponse(false);
            }
            return true; // Will respond asynchronously

          default:
            console.log(
              "[SamAI Content] Unhandled message type:",
              message.type
            );
            // No sendResponse here, as it's not a direct response to a specific message type
            return; // Indicate that the message was not handled (implicitly returns undefined)
        }
      }
    );
  },
});
