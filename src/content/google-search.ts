import { showSidePanel } from "./search";
import { searchSettingsStore } from "../../utils/store";

export async function initializeGoogleSearch() {
  // Check if search is enabled
  const settings = await searchSettingsStore.getValue();
  if (!settings.searchActive) return;

  // Get search query
  const query = new URLSearchParams(window.location.search).get("q");
  if (!query) {
    console.log("[SamAI Search] No query found in URL");
    return;
  }

  console.log("[SamAI Search] Found search query:", query);

  // Show initial panel
  showSidePanel(null);

  // Get and show response with retry
  const getResponse = async () => {
    console.log("[SamAI Search] Sending initial request to Gemini");
    const response = await browser.runtime.sendMessage({
      type: "generateGeminiResponse",
      prompt: `Search query: ${query}\n\nProvide a detailed analysis that covers:\n- Core concepts and key information\n- Notable details and important context\n- Expert insights and unique perspectives\n- Practical implications or applications\n\nEnsure the response is thorough while remaining clear and well-structured.`,
    });
    
    if (!response) {
      console.log("[SamAI Search] No response, retrying after 1s delay");
      // Wait and retry once
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("[SamAI Search] Sending retry request to Gemini");
      return browser.runtime.sendMessage({
        type: "generateGeminiResponse",
        prompt: `Search query: ${query}\nProvide a concise but informative search result that offers unique insights or perspectives on this topic.`,
      });
    }
    return response;
  };

  console.log("[SamAI Search] Initiating search for query:", query);
  getResponse()
    .then((response) => {
      console.log("[SamAI Search] Received response:", response);
      showSidePanel(response);
    })
    .catch((error) => {
      console.error("[SamAI Search] Failed to get response:", error);
      showSidePanel(null);
    });

  // Handle URL changes for new searches
  window.addEventListener("popstate", () => {
    const newQuery = new URLSearchParams(window.location.search).get("q");
    if (newQuery && newQuery !== query) {
      showSidePanel(null);
      console.log("[SamAI Search] URL changed, sending request for new query:", newQuery);
      getResponse()
        .then((response) => {
          console.log("[SamAI Search] Received response for new query:", response);
          showSidePanel(response);
        })
        .catch((error) => {
          console.error("[SamAI Search] Failed to get response for new query:", error);
          showSidePanel(null);
        });
    }
  });
}
