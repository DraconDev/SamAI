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
