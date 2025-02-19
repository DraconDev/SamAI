export default defineBackground(() => {
  // Listen for runtime messages and forward them to active tab
  
  // Create context menu item
  browser.contextMenus.create({
    id: "samai-context-menu",
    title: "Sam",
    contexts: ["all"],
  });

  // Add click handler for the context menu item
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id) return;
    
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
    
    browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "setInputValue") {
      try {
        const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (activeTab?.id) {
          // Ensure content script is injected in the active tab
          await browser.scripting.executeScript({
            target: { tabId: activeTab.id },
            files: ["content.js"]
          }).catch((err) => {
            console.log("Content script already exists:", err);
          });

          // Now send the message
          const result = await browser.tabs.sendMessage(activeTab.id, message);
          sendResponse(result);
        }
        } catch (error) {
          console.error("Error forwarding message:", error);
          sendResponse({ success: false, error: "Failed to forward message to content script" });
        }
        return true;
      }
    });
  });
});
