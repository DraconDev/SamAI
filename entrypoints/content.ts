import { createSearchContainer, showLoading, displayResults, extractSearchQuery } from '@/utils/search';
import type { SearchContainer } from '@/utils/search';

export default defineContentScript({
  matches: ["*://*.google.com/search*"],
  main() {
    let lastInputElement: HTMLInputElement | HTMLTextAreaElement | null = null;
    let searchContainer: SearchContainer | null = null;

    // Function to handle search and display results
    async function handleSearch() {
      const query = extractSearchQuery(window.location.href);
      if (!query) return;

      // Create or get container
      if (!searchContainer) {
        searchContainer = createSearchContainer();
      }

      // Show loading state
      showLoading(searchContainer.container);

      try {
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
            // Clear loading state
            geminiContainer.innerHTML = '';
            
            // Add close button back
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

            // Add content
            const content = document.createElement('div');
            content.innerHTML = `
              <h3 style="margin: 0 0 15px 0; color: #1a73e8; padding-right: 30px;">Gemini AI Results</h3>
              <div style="font-size: 14px; line-height: 1.6; color: #333;">
                ${response.replace(/\n/g, '<br>')}
              </div>
            `;
            geminiContainer.appendChild(content);
          }
        } catch (error) {
          if (geminiContainer) {
            geminiContainer.innerHTML = '<div style="color: red; padding: 20px;">Error loading Gemini results</div>';
          }
        }
        return true;
      }

      console.log("Content script received message:", message);

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
              : "textarea"
        };
        console.log("Sending input info:", response);
        sendResponse(response);
      } else if (message.type === "setInputValue" && lastInputElement) {
        try {
          lastInputElement.value = message.value;
          lastInputElement.dispatchEvent(new Event('input', { bubbles: true }));
          lastInputElement.dispatchEvent(new Event('change', { bubbles: true }));
          console.log("Updated input value:", message.value);
          sendResponse({ success: true });
        } catch (error: unknown) {
          console.error("Error setting input value:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          sendResponse({ success: false, error: errorMessage });
        }
      } else {
        console.log("No input element or wrong message type");
        sendResponse(false);
      }
      return true; // Will respond asynchronously
    });
  },
});
