export default defineBackground(() => {
  let sourceTabId: number | null = null;

  // Listen for web navigation to search pages
  browser.webNavigation.onCompleted.addListener(async (details) => {
    const url = new URL(details.url);
    // Detect search engine URLs
    if (url.hostname === 'www.google.com' && url.pathname === '/search') {
      const searchQuery = url.searchParams.get('q');
      if (searchQuery) {
        // Send search query to content script
        try {
          await browser.tabs.sendMessage(details.tabId, {
            type: 'performGeminiSearch',
            query: searchQuery
          });
        } catch (error) {
          console.error('Error sending search query:', error);
        }
      }
    }
  });

  // Create context menu item
  browser.contextMenus.create({
    id: "samai-context-menu",
    title: "Sam",
    contexts: ["all"],
  });

  // Listen for runtime messages and forward them to source tab
  browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "generateGeminiResponse") {
      try {
        const result = await generateFormResponse(message.prompt);
        sendResponse(result);
      } catch (error) {
        console.error("Error generating Gemini response:", error);
        sendResponse(null);
      }
      return true;
    }
    
    if (message.type === "setInputValue" && sourceTabId) {
      try {
        // Send message to the original source tab
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
    
    // Store the source tab ID
    sourceTabId = tab.id;
    
    try {
      console.log('Content script registered in tab:', tab.id);
      
      // Try to get input information if it's an input element
      const message = { type: 'getInputInfo' };
      console.log('Sending message to content script:', message);
      
      const response = await browser.tabs.sendMessage(tab.id, message);
      console.log('Background received response:', response);
      
      // Store input info in local storage if available
      if (response && response.messageType === 'inputInfo') {
        console.log('Input info received:', response);
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
        // Clear any existing input info if we're not clicking on an input
        await browser.storage.local.remove('inputInfo');
      }

      // Open popup
      browser.windows.create({
        url: browser.runtime.getURL("/context-popup.html"),
        type: "popup",
        width: 400,
        height: 300,
      });
    } catch (error) {
      console.error('Error in background script:', error);
      // Open regular popup if message fails (non-input or error)
      browser.windows.create({
        url: browser.runtime.getURL("/context-popup.html"),
        type: "popup",
        width: 400,
        height: 300,
      });
    }
  });

  // Clear source tab ID when the tab is closed
  browser.tabs.onRemoved.addListener((tabId) => {
    if (tabId === sourceTabId) {
      sourceTabId = null;
    }
  });
});
