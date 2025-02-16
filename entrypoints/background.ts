export default defineBackground(() => {
  // Create context menu item
  browser.contextMenus.create({
    id: "samai-context-menu",
    title: "Samai",
    contexts: ["all"],
  });

  // Add click handler for the context menu item
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'samai-context-menu') {
      browser.windows.create({
        url: browser.runtime.getURL('/context-popup/index.html'),
        type: 'popup',
        width: 400,
        height: 200
      });
    }
  });
});
