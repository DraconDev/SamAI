import {
  createSearchContainer,
  showLoading,
  displayResults,
  extractSearchQuery,
} from "./search";
import type { SearchContainer } from "./search";

export function initializeGoogleSearch() {
  console.log('[SamAI] Starting search initialization');
  
  const query = new URLSearchParams(window.location.search).get('q');
  console.log('[SamAI] Query found:', query);
  
  if (!query) {
    console.log('[SamAI] No query found, aborting initialization');
    return;
  }

  // Create container only when we have a valid query
  console.log('[SamAI] Creating search container');
  const searchContainer = createSearchContainer();

  const handleSearch = async (searchQuery: string) => {
    console.log('[SamAI] Handling search for query:', searchQuery);
    showLoading(searchContainer.container);

    try {
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
