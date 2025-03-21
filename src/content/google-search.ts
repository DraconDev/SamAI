import { showSidePanel } from "./search";
import { searchSettingsStore, PROMPT_TEMPLATES } from "../../utils/store";

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
      prompt: `Search query: ${query}\n${PROMPT_TEMPLATES[settings.promptStyle]}`,
    });

    if (!response) {
      console.log("[SamAI Search] No response, retrying after 1s delay");
      // Wait and retry once
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("[SamAI Search] Sending retry request to Gemini");
      return browser.runtime.sendMessage({
        type: "generateGeminiResponse",
        prompt: `Search query: ${query}\n${PROMPT_TEMPLATES[settings.promptStyle]}`,
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
      console.log(
        "[SamAI Search] URL changed, sending request for new query:",
        newQuery
      );
      getResponse()
        .then((response) => {
          console.log(
            "[SamAI Search] Received response for new query:",
            response
          );
          showSidePanel(response);
        })
        .catch((error) => {
          console.error(
            "[SamAI Search] Failed to get response for new query:",
            error
          );
          showSidePanel(null);
        });
    }
  });
}
