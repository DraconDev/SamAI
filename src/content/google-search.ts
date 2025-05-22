import { showSidePanel } from "./search";
import { searchSettingsStore, PROMPT_TEMPLATES } from "../../utils/store";

// Listen for responses from the background script
browser.runtime.onMessage.addListener((message: any) => {
  if (message.type === "googleSearchSummaryReady") {
    console.log("[SamAI Search] Received summary from background:", message.summary);
    showSidePanel(message.summary);
  }
});

export async function initializeGoogleSearch() {
  // Check if search is enabled
  const settings = await searchSettingsStore.getValue();
  console.log("[SamAI Search] searchActive setting:", settings.searchActive);
  if (!settings.searchActive) return;

  // Get search query
  const query = new URLSearchParams(window.location.search).get("q");
  if (!query) {
    console.log("[SamAI Search] No query found in URL");
    return;
  }

  console.log("[SamAI Search] Found search query:", query);

  // Show initial panel (spinner)
  showSidePanel(null);

  // Send the search prompt to the background script
  const fullPrompt = `Search query: ${query}\n${PROMPT_TEMPLATES[settings.promptStyle]}`;
  console.log("[SamAI Search] Sending prompt to background script:", fullPrompt);
  browser.runtime.sendMessage({
    type: "generateGoogleSearchSummary", // New message type for one-way communication
    prompt: fullPrompt,
    tabId: (await browser.tabs.getCurrent()).id // Pass current tabId for targeted response
  }).catch(error => {
    console.error("[SamAI Search] Error sending initial message to background:", error);
    showSidePanel(null);
  });

  // Handle URL changes for new searches
  window.addEventListener("popstate", async () => {
    const newQuery = new URLSearchParams(window.location.search).get("q");
    if (newQuery && newQuery !== query) {
      console.log("[SamAI Search] URL changed, sending request for new query:", newQuery);
      showSidePanel(null); // Show spinner for new search

      const newFullPrompt = `Search query: ${newQuery}\n${PROMPT_TEMPLATES[settings.promptStyle]}`;
      console.log("[SamAI Search] Sending new prompt to background script:", newFullPrompt);
      browser.runtime.sendMessage({
        type: "generateGoogleSearchSummary",
        prompt: newFullPrompt,
        tabId: (await browser.tabs.getCurrent()).id // Pass current tabId
      }).catch(error => {
        console.error("[SamAI Search] Error sending new query message to background:", error);
        showSidePanel(null);
      });
    }
  });
}
