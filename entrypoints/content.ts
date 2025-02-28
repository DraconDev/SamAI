import { initializeGoogleSearch } from "@/src/content/google-search";
import { showSidePanel } from "@/src/content/search";

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

    // Handle input element tracking
    const handleInputClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // If clicked on an input/textarea, track it
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        lastInputElement = target;
        // For left clicks (not right-clicks), open assistant popup
        if (event.button === 0) {
          browser.runtime.sendMessage({ type: "openAssistant" });
        }
      } else {
        // If clicked anywhere else, clear the tracked input
        lastInputElement = null;
      }
    };

    // Listen for all clicks and right-clicks
    document.addEventListener("click", handleInputClick);
    document.addEventListener("contextmenu", handleInputClick);

    // Handle messages from the background script
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Content script received message:", message);

      if (message.type === "getInputInfo" && lastInputElement) {
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
        console.log("Sending input info:", response);
        sendResponse(response);
      } else if (message.type === "setInputValue" && lastInputElement) {
        try {
          lastInputElement.value = message.value;
          lastInputElement.dispatchEvent(new Event("input", { bubbles: true }));
          lastInputElement.dispatchEvent(
            new Event("change", { bubbles: true })
          );
          console.log("Updated input value:", message.value);
          sendResponse({ success: true });
        } catch (error: unknown) {
          console.error("Error setting input value:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          sendResponse({ success: false, error: errorMessage });
        }
      } else if (message.type === "showSummary") {
        showSidePanel(message.summary);
        sendResponse(true);
      } else {
        console.log("No input element or wrong message type");
        sendResponse(false);
      }
      return true; // Will respond asynchronously
    });
  },
});
