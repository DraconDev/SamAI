import { initializeGoogleSearch } from "@/src/content/google-search";
import { showSidePanel } from "@/src/content/search";
import { extractPageContent } from "@/utils/page-content";

// Define message types
interface GetPageContentMessage {
  type: "getPageContent";
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

type ContentScriptMessage =
  | GetPageContentMessage
  | GetInputInfoMessage
  | SetInputValueMessage
  | ShowSummaryMessage;

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    let lastInputElement: HTMLInputElement | HTMLTextAreaElement | null = null;

    // Debug logging for Google search initialization
    console.log("[SamAI] Content script loaded", {
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      search: window.location.search,
    });

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

    // Track input element on right clicks
    document.addEventListener("contextmenu", (event) => {
      const target = event.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        lastInputElement = target;
      }
    });

    // Clear lastInputElement when clicking anywhere except inputs
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (
        !(target instanceof HTMLInputElement) &&
        !(target instanceof HTMLTextAreaElement)
      ) {
        lastInputElement = null;
      }
    });

    // Handle messages from the background script
    browser.runtime.onMessage.addListener(
      (message: ContentScriptMessage, sender, sendResponse) => {
        console.log("[SamAI Content] Received message:", message);

        if (message.type === "getPageContent") {
          console.log("[SamAI Content] Handling getPageContent message");
          try {
            console.log("[SamAI Content] Calling extractPageContent");
            const pageContent = extractPageContent();
            console.log("[SamAI Content] extractPageContent finished, sending response");
            sendResponse(pageContent);
          } catch (error) {
            console.error("[SamAI Content] Error extracting page content:", error);
            sendResponse({ error: error instanceof Error ? error.message : "Unknown error" });
          }
          return true; // Will respond asynchronously
        } else if (message.type === "getInputInfo" && lastInputElement) {
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
        } else if (message.type === "setInputValue" && lastInputElement) {
          try {
            lastInputElement.value = message.value;
            lastInputElement.dispatchEvent(new Event("input", { bubbles: true }));
            lastInputElement.dispatchEvent(
              new Event("change", { bubbles: true })
            );
            console.log("[SamAI Content] Updated input value:", message.value);
            sendResponse({ success: true });
          } catch (error: unknown) {
            console.error("[SamAI Content] Error setting input value:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            sendResponse({ success: false, error: errorMessage });
          }
        } else if (message.type === "showSummary") {
          showSidePanel(message.summary);
          sendResponse(true);
        } else {
          console.log("[SamAI Content] Unhandled message type or no input element");
          sendResponse(false);
        }
        return true; // Will respond asynchronously
      }
    );
  },
});
