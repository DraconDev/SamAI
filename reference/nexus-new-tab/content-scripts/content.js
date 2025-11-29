chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SETTINGS_CHANGED') {
        // Handle the settings change
        console.log('Settings changed:', message.settings);
    }
});
