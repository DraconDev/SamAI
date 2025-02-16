export default defineBackground(() => {
  // Create context menu item
  browser.contextMenus.create({
    id: 'samai-context-menu',
    title: 'Sam',
    contexts: ['all']
  });

  // Add click handler for the context menu item
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'samai-context-menu') {
      console.log('Samai context menu clicked');
      // Add your desired action here
    }
  });
});
