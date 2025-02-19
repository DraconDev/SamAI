import { showSidePanel } from "./search";

export function initializeGoogleSearch() {
  // Get search query
  const query = new URLSearchParams(window.location.search).get('q');
  if (!query) return;

  // Show initial panel
  showSidePanel(null);

  // Get and show response
  console.log('[SamAI] Sending request for query:', query);
  browser.runtime.sendMessage({
    type: 'generateGeminiResponse',
    prompt: `Search query: ${query}\nProvide a concise but informative search result that offers unique insights or perspectives on this topic.`
  }).then(response => {
    console.log('[SamAI] Got response:', response);
    if (response) {
      console.log('[SamAI] Processing response:', response);
      showSidePanel(response);
    } else {
      console.error('[SamAI] No response received');
      showSidePanel(null);
    }
  }).catch(error => {
    console.error('[SamAI] Request error:', error);
    showSidePanel(null);
  });

  // Handle URL changes for new searches
  window.addEventListener('popstate', () => {
    const newQuery = new URLSearchParams(window.location.search).get('q');
    if (newQuery && newQuery !== query) {
      showSidePanel(null);
      console.log('[SamAI] Sending request for new query:', newQuery);
      browser.runtime.sendMessage({
        type: 'generateGeminiResponse',
        prompt: `Search query: ${newQuery}\nProvide a concise but informative search result that offers unique insights or perspectives on this topic.`
      }).then(response => {
        console.log('[SamAI] Got response for new query:', response);
        if (response) {
          console.log('[SamAI] Processing new query response:', response);
          showSidePanel(response);
        } else {
          console.error('[SamAI] No response received for new query');
          showSidePanel(null);
        }
      }).catch(error => {
        console.error('[SamAI] Request error for new query:', error);
        showSidePanel(null);
      });
    }
  });
}
