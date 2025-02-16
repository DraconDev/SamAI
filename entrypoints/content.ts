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
    browser.runtime.onMessage.addListener(async (message) => {
      console.log('Content script received message:', message);
      console.log('Last input element:', lastInputElement);

      if (message.type === 'getInputInfo' && lastInputElement) {
        const response = {
          messageType: 'inputInfo',
          value: lastInputElement.value,
          placeholder: lastInputElement.placeholder,
          id: lastInputElement.id,
          name: lastInputElement.name,
          inputType: lastInputElement instanceof HTMLInputElement ? lastInputElement.type : 'textarea'
        };
        console.log('Sending input info:', response);
        return Promise.resolve(response);
      }
      console.log('No input element or wrong message type');
      return Promise.resolve(false);
    });
  },
});
