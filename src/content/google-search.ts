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
    const rawResponseString = await browser.runtime.sendMessage({
      type: "generateGeminiResponse",
      prompt: fullPrompt, // Use fullPrompt
    });
    console.log("[SamAI Search] Raw message response from background (initial):", rawResponseString);

    let parsedResponse: { responseText: string | null } | null = null;
    try {
      parsedResponse = JSON.parse(rawResponseString);
    } catch (e) {
      console.error("[SamAI Search] Error parsing initial response:", e);
    }
    const response = parsedResponse?.responseText || null;

    if (!response) {
      console.log("[SamAI Search] Initial response was null or not a string. Retrying after 1s delay.");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second

      const retryPrompt = `Search query: ${query}\n${PROMPT_TEMPLATES[settings.promptStyle]}`;
      console.log("[SamAI Search] Sending retry request to Gemini with prompt:", retryPrompt);

      const rawRetryResponseString = await browser.runtime.sendMessage({
        type: "generateGeminiResponse",
        prompt: retryPrompt,
      });
      console.log("[SamAI Search] Raw message response from background (retry):", rawRetryResponseString);

      let parsedRetryResponse: { responseText: string | null } | null = null;
      try {
        parsedRetryResponse = JSON.parse(rawRetryResponseString);
      } catch (e) {
        console.error("[SamAI Search] Error parsing retry response:", e);
      }
      return parsedRetryResponse?.responseText || null;
    }
    return response;
  };

  console.log("[SamAI Search] Initiating search for query:", query);
  getResponse()
    .then((response) => {
      console.log("[SamAI Search] Received response in .then():", response);
      console.log("[SamAI Search] Type of response in .then():", typeof response);
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
            "[SamAI Search] Received response for new query in .then():",
            response
          );
          console.log(
            "[SamAI Search] Type of response for new query in .then():",
            typeof response
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
