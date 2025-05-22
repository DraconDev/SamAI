import { showSidePanel } from "./search";
import { searchSettingsStore, PROMPT_TEMPLATES } from "../../utils/store";
// import { browser } from "webextension-polyfill-ts"; // Removed explicit import, relying on global 'browser'

export async function initializeGoogleSearch() {
  // Check if search is enabled
  const settings = await searchSettingsStore.getValue();
  console.log("[SamAI Search] searchActive setting:", settings.searchActive); // NEW LOG
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
    const fullPrompt = `Search query: ${query}\n${
      PROMPT_TEMPLATES[settings.promptStyle]
    }`; // NEW
    console.log(
      "[SamAI Search] Sending initial request to Gemini with prompt:",
      fullPrompt
    ); // NEW LOG
    const response = (await browser.runtime.sendMessage({
      // Cast to string | null
      type: "generateGeminiResponse",
      prompt: fullPrompt, // Use fullPrompt
    })) as string | null; // Type assertion

    if (!response) {
      console.log("[SamAI Search] No response, retrying after 1s delay");
      // Wait and retry once
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const retryPrompt = `Search query: ${query}\n${
        PROMPT_TEMPLATES[settings.promptStyle]
      }`; // NEW
      console.log(
        "[SamAI Search] Sending retry request to Gemini with prompt:",
        retryPrompt
      ); // NEW LOG
      return (await browser.runtime.sendMessage({
        // Cast to string | null
        type: "generateGeminiResponse",
        prompt: retryPrompt, // Use retryPrompt
      })) as string | null; // Type assertion
    }
    return response;
  };

  console.log("[SamAI Search] Initiating search for query:", query);
  getResponse()
    .then((response) => {
      console.log("[SamAI Search] Received response:", response ? "Received text" : "Received null");
      showSidePanel(response);
    })
    .catch((error) => {
      console.error("[SamAI Search] Failed to get response:", error);
      console.error("[SamAI Search] Error details:", error);
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
            response ? "Received text" : "Received null"
          );
          showSidePanel(response);
        })
        .catch((error) => {
          console.error(
            "[SamAI Search] Failed to get response for new query:",
            error
          );
          console.error("[SamAI Search] Error details for new query:", error);
          showSidePanel(null);
        });
    }
  });
}
