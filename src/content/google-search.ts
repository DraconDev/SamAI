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
    );

    const processResponsePayload = (payload: any, attemptType: 'initial' | 'retry'): string | null => {
      console.log(
        `[SamAI Search] Raw message payload from background (${attemptType}):`,
        payload,
        "Type:", typeof payload
      );

      let responseText: string | null = null;
      if (typeof payload === 'string') {
        try {
          const parsedJson = JSON.parse(payload);
          if (parsedJson && typeof parsedJson.responseText === 'string') {
            responseText = parsedJson.responseText;
          } else if (parsedJson && parsedJson.responseText === null) {
            console.log(`[SamAI Search] Parsed responseText is null (${attemptType}).`);
            responseText = null;
          } else {
            console.error(`[SamAI Search] Parsed response does not contain expected responseText format (${attemptType}):`, parsedJson);
            responseText = null;
          }
        } catch (e) {
          console.error(`[SamAI Search] Error parsing response string (${attemptType}):`, e, "Raw string was:", payload);
          responseText = null;
        }
      } else if (payload === null) {
        console.log(`[SamAI Search] Received literal null from background (${attemptType}). Treating as null response.`);
        responseText = null;
      } else {
        console.warn(`[SamAI Search] Unexpected payload type from background (${attemptType}):`, payload, "Type:", typeof payload);
        responseText = null;
      }
      return responseText;
    };

    // Initial attempt
    const rawInitialPayload = await browser.runtime.sendMessage({
      type: "generateGeminiResponse",
      prompt: fullPrompt,
    });
    let responseText = processResponsePayload(rawInitialPayload, 'initial');

    if (!responseText) {
      console.log(
        "[SamAI Search] Initial response processed to null or empty. Retrying after 1s delay."
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const retryPrompt = `Search query: ${query}\n${
        PROMPT_TEMPLATES[settings.promptStyle]
      }`;
      console.log(
        "[SamAI Search] Sending retry request to Gemini with prompt:",
        retryPrompt
      );

      const rawRetryPayload = await browser.runtime.sendMessage({
        type: "generateGeminiResponse",
        prompt: retryPrompt,
      });
      responseText = processResponsePayload(rawRetryPayload, 'retry');
    }
    return responseText;
  };

  console.log("[SamAI Search] Initiating search for query:", query);
  getResponse()
    .then((finalResponseText) => {
      console.log("[SamAI Search] Received final responseText in .then():", finalResponseText);
      console.log(
        "[SamAI Search] Type of finalResponseText in .then():",
        typeof finalResponseText
      );
      showSidePanel(finalResponseText);
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
