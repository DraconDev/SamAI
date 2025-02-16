export default defineBackground(() => {
  // Create context menu items
  browser.contextMenus.create({
    id: "samai-context-menu",
    title: "Sam",
    contexts: ["all"],
  });

  browser.contextMenus.create({
    id: "samai-input-menu",
    title: "Sam Prompt",
    contexts: ["editable"],
  });

  // Add click handler for the context menu items
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id) return;

    if (info.menuItemId === "samai-context-menu") {
      browser.windows.create({
        url: browser.runtime.getURL("/context-popup.html"),
        type: "popup",
        width: 400,
        height: 300,
      });
    }
    
    else if (info.menuItemId === "samai-input-menu") {
      try {
        // Get input information from the content script
        const response = await browser.tabs.sendMessage(tab.id, { type: 'getInputInfo' });
        
        // Create popup with input data in URL parameters
        if (response?.messageType === 'inputInfo') {
          const params = new URLSearchParams({
            value: response.value || '',
            placeholder: response.placeholder || '',
            inputType: response.inputType || '',
            elementId: response.id || '',
            elementName: response.name || ''
          });

          browser.windows.create({
            url: `${browser.runtime.getURL("/context-popup.html")}?${params.toString()}`,
            type: "popup",
            width: 400,
            height: 300,
          });
        }
      } catch (error) {
        console.error('Error getting input information:', error);
      }
    }
  });
});
