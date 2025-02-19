import { initializeGoogleSearch } from '@/utils/google-search';

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    let lastInputElement: HTMLInputElement | HTMLTextAreaElement | null = null;
    
    // Initialize Google search functionality if we're on a search page
    if (window.location.hostname === 'www.google.com' && window.location.pathname === '/search') {
      initializeGoogleSearch();
    }

    // Listen for right clicks to track the last input element
    document.addEventListener("contextmenu", (event) => {
      const target = event.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        lastInputElement = target;
      }
    });

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
            lastInputElement.dispatchEvent(
              new Event("input", { bubbles: true })
            );
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
        } else {
          console.log("No input element or wrong message type");
          sendResponse(false);
        }
        return true; // Will respond asynchronously
      }
    );
  },
});
