import {
  createSearchContainer,
  showLoading,
  displayResults,
  extractSearchQuery,
} from "./search";
import type { SearchContainer } from "./search";

export function initializeGoogleSearch() {
  const query = new URLSearchParams(window.location.search).get('q');
  if (!query) return;

  // Create container only when we have a valid query
  const searchContainer = createSearchContainer();

  const handleSearch = async (searchQuery: string) => {
    showLoading(searchContainer.container);

    try {
      const response = await browser.runtime.sendMessage({
        type: 'generateGeminiResponse',
        prompt: `Search query: ${searchQuery}\nProvide a concise but informative search result that offers unique insights or perspectives on this topic.`
      });

      displayResults(searchContainer.container, {
        query: searchQuery,
        geminiResponse: response
      });
    } catch (error) {
      displayResults(searchContainer.container, {
        query: searchQuery,
        geminiResponse: null
      });
    }
  };

  // Initial search
  handleSearch(query);

  // Handle URL changes through history state updates
  const handleURLChange = () => {
    const newQuery = new URLSearchParams(window.location.search).get('q');
    if (newQuery && newQuery !== query) {
      handleSearch(newQuery);
    }
  };

  window.addEventListener('popstate', handleURLChange);
  window.addEventListener('pushstate', handleURLChange);
  window.addEventListener('replacestate', handleURLChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('popstate', handleURLChange);
    window.removeEventListener('pushstate', handleURLChange);
    window.removeEventListener('replacestate', handleURLChange);
    searchContainer.remove();
  };
}
