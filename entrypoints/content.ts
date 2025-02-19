export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    let lastInputElement: HTMLInputElement | HTMLTextAreaElement | null = null;
    
    // Track input elements on focus
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

    // Also track on right click
    document.addEventListener("contextmenu", (event) => {
      const target = event.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        lastInputElement = target;
        console.log("Input element right-clicked:", lastInputElement);
      }
    });

    // Listen for blur to maybe clear the reference
    document.addEventListener("focusout", (event) => {
      const target = event.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement &&
        target === lastInputElement
      ) {
        console.log("Sending input info:", response);
        sendResponse(response);
      } else if (message.type === "setInputValue" && lastInputElement && message.value) {
        lastInputElement.value = message.value;
        lastInputElement.dispatchEvent(new Event('input', { bubbles: true }));
        lastInputElement.dispatchEvent(new Event('change', { bubbles: true }));
        console.log("Updated input value:", message.value);
        sendResponse(true);
      } else {
        console.log("No input element or wrong message type");
        sendResponse(false);
      }
      return true; // Will respond asynchronously
    });
  },
});
