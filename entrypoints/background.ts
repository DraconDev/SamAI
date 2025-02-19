export default defineBackground(() => {
  let activeTabId: number | null = null;

  // Create context menu item
  browser.contextMenus.create({
    id: "samai-context-menu",
    title: "Sam",
    contexts: ["all"],
  });

  // Listen for messages from popup to content script
  browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.target === 'content' && activeTabId) {
      try {
        const response = await browser.tabs.sendMessage(activeTabId, message.data);
        sendResponse(response);
      } catch (error) {
        console.error('Error sending message to content script:', error);
        sendResponse({ error: 'Failed to communicate with content script' });
      }
      return true;
    }
  });

  // Add click handler for the context menu item
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id) return;
    
    activeTabId = tab.id;
    
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
            elementName: response.name || '',
            tabId: tab.id // Store the tab ID with the input info
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

  // Clean up when a tab is closed
  browser.tabs.onRemoved.addListener((tabId) => {
    if (tabId === activeTabId) {
      activeTabId = null;
    }
  });
});
