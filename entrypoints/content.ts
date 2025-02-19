export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    let lastInputElement: HTMLInputElement | HTMLTextAreaElement | null = null;
    let geminiContainer: HTMLDivElement | null = null;

    // Function to create and inject Gemini results container
    function createGeminiContainer() {
      if (geminiContainer) return;

      geminiContainer = document.createElement("div");
      geminiContainer.id = "samai-gemini-results";
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
      const closeButton = document.createElement("button");
      closeButton.innerHTML = "×";
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
    browser.runtime.onMessage.addListener(
      async (message, sender, sendResponse) => {
        // Handle Gemini search requests
        if (message.type === "performGeminiSearch") {
          createGeminiContainer();
          if (!geminiContainer) return;

          // Show loading state
          const loadingDiv = document.createElement("div");
          loadingDiv.style.cssText = `
          text-align: center;
          padding: 20px;
          color: #666;
        `;
          loadingDiv.innerHTML = "Loading Gemini results...";
          geminiContainer.appendChild(loadingDiv);

          try {
            const response = await browser.runtime.sendMessage({
              type: "generateGeminiResponse",
              prompt: `Search query: ${message.query}\nProvide a concise but informative search result that offers unique insights or perspectives on this topic.`,
            });

            if (response && geminiContainer) {
              // Clear loading state
              geminiContainer.innerHTML = "";

              // Add close button back
              const closeButton = document.createElement("button");
              closeButton.innerHTML = "×";
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
              const content = document.createElement("div");
              content.innerHTML = `
              <h3 style="margin: 0 0 15px 0; color: #1a73e8; padding-right: 30px;">Gemini AI Results</h3>
              <div style="font-size: 14px; line-height: 1.6; color: #333;">
                ${response.replace(/\n/g, "<br>")}
              </div>
            `;
              geminiContainer.appendChild(content);
            }
          } catch (error) {
            if (geminiContainer) {
              geminiContainer.innerHTML =
                '<div style="color: red; padding: 20px;">Error loading Gemini results</div>';
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
                : "textarea",
          };
          console.log("Sending input info:", response);
          sendResponse(response);
        } else if (message.type === "setInputValue" && lastInputElement) {
          try {
            lastInputElement.value = message.value;
            lastInputElement.dispatchEvent(
              new Event("input", { bubbles: true })
            );
            lastInputElement.dispatchEvent(
              new Event("change", { bubbles: true })
            );
            console.log("Updated input value:", message.value);
            sendResponse({ success: true });
          } catch (error: unknown) {
            console.error("Error setting input value:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            sendResponse({ success: false, error: errorMessage });
          }
        } else {
          console.log("No input element or wrong message type");
          sendResponse(false);
        }
        return true; // Will respond asynchronously
      }
    );
  },
});
