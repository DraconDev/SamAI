export default defineBackground(() => {
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
      // Try to get input information if it's an input element
      const message = { type: 'getInputInfo' };
      console.log('Sending message to content script:', message);
      
      const response = await browser.tabs.sendMessage(tab.id, message);
      console.log('Background received response:', response);
      
      // Store input info in local storage if available
      if (response && typeof response === 'object' && response.messageType === 'inputInfo') {
        console.log('Storing input info:', response);
        await browser.storage.local.set({ inputInfo: {
          value: response.value || '',
          placeholder: response.placeholder || '',
          inputType: response.inputType || '',
          elementId: response.id || '',
          elementName: response.name || ''
        }});
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
});
