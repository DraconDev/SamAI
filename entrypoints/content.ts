import { createSearchContainer, showLoading, displayResults, extractSearchQuery } from '@/utils/search';
import type { SearchContainer } from '@/utils/search';

export default defineContentScript({
  matches: ["*://*.google.com/search*"],
  main() {
    let lastInputElement: HTMLInputElement | HTMLTextAreaElement | null = null;
    let searchContainer: SearchContainer | null = null;

    // Function to handle search and display results
    async function handleSearch() {
      const query = extractSearchQuery(window.location.href);
      if (!query) return;

      // Create or get container
      if (!searchContainer) {
        searchContainer = createSearchContainer();
      }

      // Show loading state
      showLoading(searchContainer.container);

      try {
        const response = await browser.runtime.sendMessage({
          type: 'generateGeminiResponse',
          prompt: `Search query: ${query}\nProvide a concise but informative search result that offers unique insights or perspectives on this topic.`
        });

        displayResults(searchContainer.container, {
          query,
          geminiResponse: response
        });
      } catch (error) {
        displayResults(searchContainer.container, {
          query,
          geminiResponse: null
        });
      }
    }

    // Initial search when page loads
    handleSearch();

    // Watch for URL changes (for when user searches without page reload)
    const observer = new MutationObserver(() => {
      const currentQuery = extractSearchQuery(window.location.href);
      if (currentQuery) {
        handleSearch();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    // Cleanup observer when script is unloaded
    return () => observer.disconnect();

    // Handle input info requests for context menu
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
              : "textarea"
        };
        console.log("Sending input info:", response);
        sendResponse(response);
        return true;
      } 
      
      if (message.type === "setInputValue" && lastInputElement) {
        try {
          lastInputElement.value = message.value;
          lastInputElement.dispatchEvent(new Event('input', { bubbles: true }));
          lastInputElement.dispatchEvent(new Event('change', { bubbles: true }));
          console.log("Updated input value:", message.value);
          sendResponse({ success: true });
        } catch (error: unknown) {
          console.error("Error setting input value:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          sendResponse({ success: false, error: errorMessage });
        }
      } else {
        console.log("No input element or wrong message type");
        sendResponse(false);
      }
      return true; // Will respond asynchronously
    });
  },
});
