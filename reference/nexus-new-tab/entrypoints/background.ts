import { defaultIcons } from "@/lib/defaultIcons";
import { DEFAULT_BACKGROUND } from "@/lib/constants";

export default defineBackground(() => {
    // Enhanced logging for debugging
    console.log("Background script initialized");

    // Initialize storage with default values if empty
    chrome.runtime.onInstalled.addListener(async () => {
        console.log("Extension installed");

        try {
            // Initialize settings if they don't exist
            const result = await chrome.storage.sync.get(["settings"]);
            if (!result.settings) {
                await chrome.storage.sync.set({
                    settings: {
                        isDraggingDisabled: false,
                        iconSize: "normal",
                    },
                });
                console.log("Default settings initialized");
            }

            // Initialize icons if they don't exist
            const iconsResult = await chrome.storage.sync.get(["icons"]);
            if (!iconsResult.icons) {
                await chrome.storage.sync.set({ icons: defaultIcons });
                console.log("Default icons initialized");
            }
        } catch (error) {
            console.error("Error during initial setup:", error);
        }

        // Listen for settings changes
        chrome.storage.onChanged.addListener((changes) => {
            if (changes.settings) {
                console.log("Settings changed, attempting to notify tabs");

                // Use promise-based tabs query
                chrome.tabs.query({}, (tabs) => {
                    tabs.forEach((tab) => {
                        if (tab.id) {
                            try {
                                chrome.tabs.sendMessage(
                                    tab.id,
                                    {
                                        type: "SETTINGS_CHANGED",
                                        settings: changes.settings.newValue,
                                    },
                                    (response) => {
                                        // Check for any runtime errors
                                        if (chrome.runtime.lastError) {
                                            console.error(
                                                `Error sending message to tab ${tab.id}:`,
                                                chrome.runtime.lastError
                                            );
                                        } else {
                                            console.log(
                                                `Successfully sent settings to tab ${tab.id}`
                                            );
                                        }
                                    }
                                );
                            } catch (error) {
                                console.error(
                                    `Caught error sending message to tab ${tab.id}:`,
                                    error
                                );
                            }
                        }
                    });
                });
            }
        });

        // More robust message listener
        chrome.runtime.onMessage.addListener(
            (message, sender, sendResponse) => {
                console.log("Message received:", message);

                try {
                    if (message.type === "UPDATE_SETTINGS") {
                        chrome.storage.sync.set(
                            { settings: message.settings },
                            () => {
                                if (chrome.runtime.lastError) {
                                    console.error(
                                        "Error updating settings:",
                                        chrome.runtime.lastError
                                    );
                                    sendResponse({
                                        success: false,
                                        error: chrome.runtime.lastError,
                                    });
                                } else {
                                    console.log(
                                        "Settings updated successfully"
                                    );
                                    sendResponse({ success: true });
                                }
                            }
                        );
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        console.error("Error processing message:", error);
                        sendResponse({ success: false, error: error.message });
                    } else {
                        console.error("Unexpected error:", error);
                        sendResponse({ success: false, error: "An unexpected error occurred." });
                    }
                }

                // Return true to indicate you wish to send a response asynchronously
                return true;
            }
        );
    });

    // Listen for extension icon clicks
    chrome.action.onClicked.addListener(() => {
        chrome.tabs.create({ url: "chrome://newtab" });
        console.log("Extension icon clicked");
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener(async (changes, namespace) => {
        if (namespace !== 'sync') return;

        try {
            // Get all tabs
            const tabs = await chrome.tabs.query({});
            
            // Filter for newtab pages only
            const newTabPages = tabs.filter(tab => tab.url?.startsWith('chrome://newtab'));

            // Send message to each newtab page
            for (const tab of newTabPages) {
                try {
                    if (tab.id) {
                        await chrome.tabs.sendMessage(tab.id, {
                            type: 'STORAGE_CHANGED',
                            changes
                        }).catch(() => {
                            // Silently fail if tab doesn't exist or isn't ready
                        });
                    }
                } catch (error) {
                    // Silently fail for individual tab errors
                }
            }
        } catch (error) {
            console.error('Error handling storage changes:', error);
        }
    });
});
