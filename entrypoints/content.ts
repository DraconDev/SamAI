export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    let lastInputElement: HTMLInputElement | HTMLTextAreaElement | null = null;
    const tabId = crypto.randomUUID(); // Generate unique ID for this tab instance

    // Listen for right clicks to track the last input element
    document.addEventListener("contextmenu", (event) => {
      const target = event.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        lastInputElement = target;
        console.log("Input element right-clicked:", lastInputElement);
      } else {
        lastInputElement = null;
      }
    });

    // Also track focus events to maintain input reference
    document.addEventListener("focusin", (event) => {
      const target = event.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        lastInputElement = target;
        console.log("Input element focused:", lastInputElement);
      }
    });

    console.log("Content script initialized with tab ID:", tabId);

    // Register with background script
    browser.runtime.sendMessage({
      type: "contentScriptReady",
      tabId: tabId
    }).catch(console.error);

    // Return true from the listener to indicate we want to send a response
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Content script received message:", message);
      console.log("Last input element:", lastInputElement);

      if (message.type === "getInputInfo" && lastInputElement) {
        const response = {
          messageType: "inputInfo",
          value: lastInputElement.value,
          placeholder: lastInputElement.placeholder,
          id: lastInputElement.id,
          name: lastInputElement.name,
          inputType:
            lastInputElement instanceof HTMLInputElement
              ? lastInputElement.type
              : "textarea",
          tabId: tabId // Include tab ID in response
        };
        console.log("Sending input info:", response);
        sendResponse(response);
      } else if (message.type === "setInputValue" && lastInputElement && message.value) {
        try {
          lastInputElement.value = message.value;
          lastInputElement.dispatchEvent(new Event('input', { bubbles: true }));
          lastInputElement.dispatchEvent(new Event('change', { bubbles: true }));
          console.log("Updated input value:", message.value);
          sendResponse({ success: true, tabId: tabId });
        } catch (error) {
          console.error("Error setting input value:", error);
          sendResponse({ error: "Failed to set input value", tabId: tabId });
        }
      } else {
        console.log("No input element or wrong message type");
        sendResponse({ error: "Invalid request", tabId: tabId });
      }
      return true; // Will respond asynchronously
    });

    // Keep the content script active
    setInterval(() => {
      browser.runtime.sendMessage({
        type: "contentScriptHeartbeat",
        tabId: tabId
      }).catch(() => {
        // Ignore errors, this is just to keep the connection alive
      });
    }, 25000);
  },
});
