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
