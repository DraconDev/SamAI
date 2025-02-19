import { showSidePanel } from "./search";

export function initializeGoogleSearch() {
  // Get search query
  const query = new URLSearchParams(window.location.search).get('q');
  if (!query) return;

  // Show initial panel
  showSidePanel(null);

  // Get and show response
  browser.runtime.sendMessage({
    type: 'generateGeminiResponse',
    prompt: `Search query: ${query}\nProvide a concise but informative search result that offers unique insights or perspectives on this topic.`
  }).then(response => {
    showSidePanel(response);
  }).catch(error => {
    console.error('[SamAI] Error:', error);
    showSidePanel(null);
  });

  // Handle URL changes for new searches
  window.addEventListener('popstate', () => {
    const newQuery = new URLSearchParams(window.location.search).get('q');
    if (newQuery && newQuery !== query) {
      showSidePanel(null);
      browser.runtime.sendMessage({
        type: 'generateGeminiResponse',
        prompt: `Search query: ${newQuery}\nProvide a concise but informative search result that offers unique insights or perspectives on this topic.`
      }).then(response => {
        showSidePanel(response);
      }).catch(error => {
        console.error('[SamAI] Error:', error);
        showSidePanel(null);
      });
    }
  });
}
