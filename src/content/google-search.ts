import { showSidePanel } from "./search";
import { searchSettingsStore, PROMPT_TEMPLATES } from "../../utils/store";
import type { Port } from "wxt/browser"; // Import Port type

let googleSearchPort: Port | null = null; // Declare a module-scoped port

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

  // Establish a long-lived connection if not already established
  if (!googleSearchPort) {
    console.log("[SamAI Search] Connecting to background script for Google Search.");
    googleSearchPort = browser.runtime.connect({ name: "googleSearchPort" });

    // Listen for messages from the background script
    googleSearchPort.onMessage.addListener((message: any) => {
      if (message.type === "googleSearchResponse") {
        console.log("[SamAI Search] Received response from background script:", message.summary);
        showSidePanel(message.summary);
      } else if (message.type === "googleSearchError") {
        console.error("[SamAI Search] Received error from background script:", message.error);
        showSidePanel(null); // Show spinner or error state
      }
    });

    // Handle disconnection
    googleSearchPort.onDisconnect.addListener(() => {
      console.log("[SamAI Search] Disconnected from background script.");
      googleSearchPort = null;
      showSidePanel(null); // Clear panel on disconnect
    });
  }

  // Send the search prompt to the background script via the port
  if (googleSearchPort) {
    const fullPrompt = `Search query: ${query}\n${PROMPT_TEMPLATES[settings.promptStyle]}`;
    console.log("[SamAI Search] Sending prompt to background script via port:", fullPrompt);
    googleSearchPort.postMessage({
      type: "generateGoogleSearchSummary", // New message type for port communication
      prompt: fullPrompt,
    });
  } else {
    console.error("[SamAI Search] Port not established, cannot send prompt.");
    showSidePanel(null);
  }

  // Handle URL changes for new searches
  window.addEventListener("popstate", () => {
    const newQuery = new URLSearchParams(window.location.search).get("q");
    if (newQuery && newQuery !== query) {
      console.log("[SamAI Search] URL changed, sending request for new query:", newQuery);
      showSidePanel(null); // Show spinner for new search

      if (googleSearchPort) {
        const newFullPrompt = `Search query: ${newQuery}\n${PROMPT_TEMPLATES[settings.promptStyle]}`;
        console.log("[SamAI Search] Sending new prompt to background script via port:", newFullPrompt);
        googleSearchPort.postMessage({
          type: "generateGoogleSearchSummary",
          prompt: newFullPrompt,
        });
      } else {
        console.error("[SamAI Search] Port not established for new query, cannot send prompt.");
        showSidePanel(null);
      }
    }
  });
}
