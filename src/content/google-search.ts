import { createSearchContainer, showLoading, displayResults, extractSearchQuery } from './search';
import type { SearchContainer } from './search';
import type { Browser } from 'webextension-polyfill-ts';
declare const browser: Browser;

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

  // Watch for URL changes using a more efficient approach
  let lastUrl = window.location.href;
  const checkForURLChange = () => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      const currentQuery = extractSearchQuery(lastUrl);
      if (currentQuery) {
        handleSearch();
      }
    }
  };

  // Check URL changes every second instead of watching all DOM changes
  const urlCheckInterval = setInterval(checkForURLChange, 1000);

  // Return cleanup function
  return () => clearInterval(urlCheckInterval);
}
