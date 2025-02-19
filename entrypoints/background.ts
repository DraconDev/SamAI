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
  browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("[SamAI] Background received message:", message);

    if (message.type === "generateGeminiResponse") {
      console.log("[SamAI] Calling Gemini API with prompt:", message.prompt);
      try {
        const result = await generateFormResponse(message.prompt);
        console.log("[SamAI] Gemini API response:", result);
        
        // Send response back to content script
        console.log("[SamAI] Sending response to content script");
        sendResponse(result);
        console.log("[SamAI] Response sent");
      } catch (error) {
        console.error("[SamAI] Gemini API error:", error);
        sendResponse(null);
      }
      return true; // Will respond asynchronously
    }

    if (message.type === "setInputValue" && sourceTabId) {
      try {
        const result = await browser.tabs.sendMessage(sourceTabId, message);
        sendResponse(result);
      } catch (error) {
        console.error("Error forwarding message:", error);
        sendResponse({ success: false, error: "Failed to forward message to content script" });
      }
      return true;
    }
  });

  // Add click handler for the context menu item
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id) return;
    
    sourceTabId = tab.id;
    
    try {
      const message = { type: 'getInputInfo' };
      const response = await browser.tabs.sendMessage(tab.id, message);
      
      if (response && response.messageType === 'inputInfo') {
        await browser.storage.local.set({ 
          inputInfo: {
            value: response.value || '',
            placeholder: response.placeholder || '',
            inputType: response.inputType || '',
            elementId: response.id || '',
            elementName: response.name || ''
          }
        });
      } else {
        await browser.storage.local.remove('inputInfo');
      }

      browser.windows.create({
        url: browser.runtime.getURL("/context-popup.html"),
        type: "popup",
        width: 400,
        height: 300,
      });
    } catch (error) {
      console.error("Error in background script:", error);
      browser.windows.create({
        url: browser.runtime.getURL("/context-popup.html"),
        type: "popup",
        width: 400,
        height: 300,
      });
    }
  });

  browser.tabs.onRemoved.addListener((tabId) => {
    if (tabId === sourceTabId) {
      sourceTabId = null;
    }
  });
});
