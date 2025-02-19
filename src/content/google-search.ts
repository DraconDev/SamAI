import {
  createSearchContainer,
  showLoading,
  displayResults,
  extractSearchQuery,
} from "./search";
import type { SearchContainer } from "./search";

export function initializeGoogleSearch() {
  console.log("[SamAI] Starting search initialization");

  const query = new URLSearchParams(window.location.search).get("q");
  console.log("[SamAI] Query found:", query);

  if (!query) {
    console.log("[SamAI] No query found, aborting initialization");
    return;
  }

  // Create container only when we have a valid query
  console.log("[SamAI] Creating search container");
  const searchContainer = createSearchContainer();

  const handleSearch = async (searchQuery: string) => {
    console.log("[SamAI] Handling search for query:", searchQuery);
    showLoading(searchContainer.container);

    try {
      console.log("[SamAI] Sending message to background script");
      const response = await browser.runtime.sendMessage({
        type: "generateGeminiResponse",
        prompt: `Search query: ${searchQuery}\nProvide a concise but informative search result that offers unique insights or perspectives on this topic.`,
      });

      console.log("[SamAI] Received response:", response);
      displayResults(searchContainer.container, {
        query: searchQuery,
        geminiResponse: response,
      });
      console.log("[SamAI] Results displayed successfully");
    } catch (error) {
      console.error("[SamAI] Error handling search:", error);
      displayResults(searchContainer.container, {
        query: searchQuery,
        geminiResponse: null,
      });
    }
  };

  // Initial search
  console.log("[SamAI] Starting initial search");
  handleSearch(query);

  // Handle URL changes through history state updates
  const handleURLChange = () => {
    console.log("[SamAI] URL change detected");
    const newQuery = new URLSearchParams(window.location.search).get("q");
    if (newQuery && newQuery !== query) {
      console.log("[SamAI] New query detected:", newQuery);
      handleSearch(newQuery);
    }
  };

  console.log("[SamAI] Setting up URL change listeners");
  window.addEventListener("popstate", handleURLChange);
  window.addEventListener("pushstate", handleURLChange);
  window.addEventListener("replacestate", handleURLChange);

  // Return cleanup function
  return () => {
    console.log("[SamAI] Cleaning up search functionality");
    window.removeEventListener("popstate", handleURLChange);
    window.removeEventListener("pushstate", handleURLChange);
    window.removeEventListener("replacestate", handleURLChange);
    searchContainer.remove();
  };
}
