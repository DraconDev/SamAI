export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    let lastInputElement: HTMLInputElement | HTMLTextAreaElement | null = null;
    let geminiContainer: HTMLDivElement | null = null;

    // Function to create and inject Gemini results container
    function createGeminiContainer() {
      if (geminiContainer) return;

      geminiContainer = document.createElement('div');
      geminiContainer.id = 'samai-gemini-results';
      geminiContainer.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 300px;
        height: 100vh;
        background: white;
        box-shadow: -2px 0 5px rgba(0,0,0,0.1);
        padding: 20px;
        overflow-y: auto;
        z-index: 1000;
        font-family: Arial, sans-serif;
      `;
      document.body.appendChild(geminiContainer);

      // Add close button
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '×';
      closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
      `;
      closeButton.onclick = () => {
        geminiContainer?.remove();
        geminiContainer = null;
      };
      geminiContainer.appendChild(closeButton);
    }

    // Listen for right clicks to track the last input element
    document.addEventListener("contextmenu", (event) => {
      const target = event.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        lastInputElement = target;
      }
    });

    // Handle messages from the background script
    browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      // Handle Gemini search requests
      if (message.type === 'performGeminiSearch') {
        createGeminiContainer();
        if (!geminiContainer) return;

        // Show loading state
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = `
          text-align: center;
          padding: 20px;
          color: #666;
        `;
        loadingDiv.innerHTML = 'Loading Gemini results...';
        geminiContainer.appendChild(loadingDiv);

        try {
          const response = await browser.runtime.sendMessage({
            type: 'generateGeminiResponse',
            prompt: `Search query: ${message.query}\nProvide a concise but informative search result that offers unique insights or perspectives on this topic.`
          });

          if (response && geminiContainer) {
