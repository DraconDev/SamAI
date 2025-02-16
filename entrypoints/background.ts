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
      const response = await browser.tabs.sendMessage(tab.id, { type: 'getInputInfo' });
      
      // Create popup with input data in URL parameters if available
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
      } else {
        // Regular popup if not an input element
        browser.windows.create({
          url: browser.runtime.getURL("/context-popup.html"),
          type: "popup",
          width: 400,
          height: 300,
        });
      }
    } catch (error) {
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
