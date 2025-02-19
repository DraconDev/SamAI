import { generateFormResponse } from "@/utils/ai/gemini";

export default defineBackground(() => {
  let sourceTabId: number | null = null;

  // Create context menu item
  browser.contextMenus.create({
    id: "samai-context-menu",
    title: "Sam",
    contexts: ["all"],
  });

  // Listen for runtime messages and forward them to source tab
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[SamAI Background] Received message:", message);

    if (message.type === "generateGeminiResponse") {
      // Start async operation
      generateFormResponse(message.prompt)
        .then(text => {
          console.log("[SamAI Background] Generated response:", text);
          sendResponse(text);
        })
        .catch(error => {
          console.error("[SamAI Background] Error:", error);
          sendResponse(null);
        });
      return true; // Will respond asynchronously
    }

    if (message.type === "setInputValue" && sourceTabId) {
      // Handle input value setting
      browser.tabs.sendMessage(sourceTabId, message)
        .then(result => {
          sendResponse(result);
        })
        .catch(error => {
          console.error("Error forwarding message:", error);
          sendResponse({
            success: false,
            error: "Failed to forward message to content script",
          });
        });
      return true;
    }
  });

  // Add click handler for the context menu item
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab?.id) return;
    sourceTabId = tab.id;

    // Try to get input information
    browser.tabs.sendMessage(tab.id, { type: "getInputInfo" })
      .then(response => {
        if (response && response.messageType === "inputInfo") {
          return browser.storage.local.set({
            inputInfo: {
              value: response.value || "",
              placeholder: response.placeholder || "",
              inputType: response.inputType || "",
              elementId: response.id || "",
              elementName: response.name || "",
            },
          });
        } else {
          return browser.storage.local.remove("inputInfo");
        }
      })
      .then(() => {
        // Open popup
        browser.windows.create({
          url: browser.runtime.getURL("/context-popup.html"),
          type: "popup",
          width: 400,
          height: 300,
        });
      })
      .catch(error => {
        console.error("Error in background script:", error);
        // Open popup anyway
        browser.windows.create({
          url: browser.runtime.getURL("/context-popup.html"),
          type: "popup",
          width: 400,
          height: 300,
        });
      });
  });

  // Clear source tab ID when the tab is closed
  browser.tabs.onRemoved.addListener((tabId) => {
    if (tabId === sourceTabId) {
      sourceTabId = null;
    }
  });
});
