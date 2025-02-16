export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    let lastInputElement: HTMLInputElement | HTMLTextAreaElement | null = null;

    // Listen for right clicks to track the last input element
    document.addEventListener('contextmenu', (event) => {
      const target = event.target as HTMLElement;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        lastInputElement = target;
      } else {
        lastInputElement = null;
      }
    });

    // Listen for messages from the background script
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === 'getInputInfo' && lastInputElement) {
        return {
          messageType: 'inputInfo',
          value: lastInputElement.value,
          placeholder: lastInputElement.placeholder,
          id: lastInputElement.id,
          name: lastInputElement.name,
          inputType: lastInputElement instanceof HTMLInputElement ? lastInputElement.type : 'textarea'
        };
      }
      return false;
    });
  },
});
