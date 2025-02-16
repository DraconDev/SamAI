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
      
      let url = browser.runtime.getURL("/context-popup.html");

      // Check if we have valid input info
      if (response && typeof response === 'object' && response.messageType === 'inputInfo') {
        console.log('Valid input info received:', response);
        const params = new URLSearchParams();
        
        // Only add params that exist
        if (response.value) params.append('value', response.value);
        if (response.placeholder) params.append('placeholder', response.placeholder);
        if (response.inputType) params.append('inputType', response.inputType);
        if (response.id) params.append('elementId', response.id);
        if (response.name) params.append('elementName', response.name);
        
        // Only append params if we have any
        if (params.toString()) {
          url = `${url}?${params.toString()}`;
          console.log('Created URL with params:', url);
        }
      }

      console.log('Opening popup with final URL:', url);
      browser.windows.create({
        url,
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
