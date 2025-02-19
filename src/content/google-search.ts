import { createSearchContainer, showLoading, displayResults, extractSearchQuery } from './search';
import type { SearchContainer } from './search';

export function initializeGoogleSearch() {
  let searchContainer: SearchContainer | null = null;

  const handleSearch = async () => {
    const query = extractSearchQuery(window.location.href);
    if (!query) return;

    if (!searchContainer) {
      searchContainer = createSearchContainer();
    }

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
  };

  // Initial search when function is called
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

  // Return cleanup function
  return () => observer.disconnect();
}
