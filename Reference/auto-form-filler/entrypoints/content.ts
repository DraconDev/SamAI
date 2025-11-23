import { AutoFormFiller } from "@/src/contentScript";

export default defineContentScript({
    matches: ["*://*/*"],
    main() {
        // console.log("Content script loaded");

        chrome.runtime.onMessage.addListener(
            (message, sender, sendResponse) => {
                // console.log("Content script received message:", message);

                if (message.action === "fillForm") {
                    // console.log("Filling form with prompt:", message.prompt);
                    AutoFormFiller.run(message.prompt)
                        .then(() => {
                            // console.log("Form fill completed");
                            sendResponse({ success: true });
                        })
                        .catch((error) => {
                            console.error("Form fill failed:", error);
                            sendResponse({
                                success: false,
                                error:
                                    error instanceof Error
                                        ? error.message
                                        : "Unknown error",
                            });
                        });
                    return true; // Keep the message channel open for async response
                }
            }
        );
    },
});
