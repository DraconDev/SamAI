export default defineBackground(() => {
  // Create context menu item
  browser.contextMenus.create({
    id: "samai-context-menu",
    title: "Sam",
    contexts: ["editable"], // Only show for input elements
  });

  // Add click handler for the context menu item
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "samai-context-menu") {
      browser.windows.create({
        url: browser.runtime.getURL("/context-popup.html"),
        type: "popup",
        width: 300,
        height: 300,
      });
    }
  });
});
