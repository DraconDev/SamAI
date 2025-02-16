export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    let lastInputElement: HTMLInputElement | null = null;

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
          type: 'inputInfo',
          value: lastInputElement.value,
          placeholder: lastInputElement.placeholder,
          id: lastInputElement.id,
          name: lastInputElement.name,
          type: lastInputElement.type
        };
      }
      return false;
    });
  },
});
