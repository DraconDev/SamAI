import { initializeGoogleSearch } from "@/src/content/google-search";
import { showSidePanel } from "@/src/content/search";
import { routeMessage, isContentScriptMessage } from "@/utils/content/messageHandlers";
import type { OutputFormat } from "@/utils/page-content"; // Import OutputFormat
import { extractPageContent } from "@/utils/page-content";
import { searchSettingsStore } from "@/utils/store";
import { SearchHighlighter } from "@/utils/searchHighlighter";

export interface InputElementClickedMessage {
  type: "inputElementClicked";
  inputInfo: {
    value: string;
    placeholder: string;
    id: string;
    name: string;
    inputType: string;
  };
}

export default defineContentScript({
  matches: ["http://*/*", "https://*/*"], // Exclude chrome-extension:// URLs
  main() {
    let lastInputElement: HTMLInputElement | HTMLTextAreaElement | null = null;

    // Debug logging for Google search initialization
    console.log("[SamAI] Content script loaded", {
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      search: window.location.search,
    });
    console.log(
      "[SamAI] document.body.innerText length on load:",
      document.body.innerText.length
    ); // NEW LOG

    // Initialize Google search functionality if we're on a search page with a query
    if (
      window.location.hostname === "www.google.com" &&
      window.location.pathname === "/search" &&
      new URLSearchParams(window.location.search).has("q") &&
      !new URLSearchParams(window.location.search).has("tbm") // Exclude specific search types like images (tbm=isch)
    ) {
      console.log("[SamAI] Initializing Google search functionality");
      // Delay initialization slightly to avoid blocking page load
      setTimeout(() => {
        console.log("[SamAI] Running delayed initialization");
        initializeGoogleSearch();
      }, 500);
    } else {
    } else {
      console.log("[SamAI] Not initializing - conditions not met");
    }

    // Initialize search highlighting for all search pages
    if (this.isSearchPage()) {
      console.log("[SamAI] Initializing search highlighter");
      setTimeout(() => {
        new SearchHighlighter();
      }, 1000);
    }
      console.log("[SamAI] Not initializing - conditions not met");
    }

    // Track input element on right clicks and send info to background script
    document.addEventListener("contextmenu", (event) => {
      const target = event.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        lastInputElement = target;
        console.log(
          "[SamAI Content] Input element right-clicked:",
          lastInputElement
        );

        // Send input info to background script
        browser.runtime
          .sendMessage({
            type: "inputElementClicked",
            inputInfo: {
              value: lastInputElement.value,
              placeholder: lastInputElement.placeholder,
              id: lastInputElement.id,
              name: lastInputElement.name,
              inputType:
                lastInputElement instanceof HTMLInputElement
                  ? lastInputElement.type
                  : "textarea",
            },
          })
          .catch((error) =>
            console.error("Error sending inputElementClicked message:", error)
          );
      } else {
        // If right-clicked element is NOT an input, clear any existing inputInfo
        console.log(
          "[SamAI Content] Right-clicked element is not an input, sending clearInputElement message."
        );
        browser.runtime
          .sendMessage({
            type: "clearInputElement",
          })
          .catch((error) =>
            console.error(
              "Error sending clearInputElement message on non-input right-click:",
              error
            )
          );
      }
    });

    // Track input element on left clicks and send info to background script
    document.addEventListener("mousedown", (event) => {
      const target = event.target as HTMLElement;
      // Check if it's a left click (event.button === 0) and the target is an input or textarea
      if (
        event.button === 0 &&
        (target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement)
      ) {
        lastInputElement = target;
        console.log(
          "[SamAI Content] Input element left-clicked:",
          lastInputElement
        );

        // Send input info to background script to open the context popup
        browser.runtime
          .sendMessage({
            type: "inputElementClicked", // Reuse existing message type
            inputInfo: {
              value: lastInputElement.value,
              placeholder: lastInputElement.placeholder,
              id: lastInputElement.id,
              name: lastInputElement.name,
              inputType:
                lastInputElement instanceof HTMLInputElement
                  ? lastInputElement.type
                  : "textarea",
            },
          })
          .catch((error) =>
            console.error("Error sending inputElementClicked message:", error)
          );
      }
    });

    // Floating Icon Logic
    const injectFloatingIcon = async () => {
      const settings = await searchSettingsStore.getValue();
      const showIcon = settings.showFloatingIcon ?? true;

      if (!showIcon) return;

      const icon = document.createElement("div");
      icon.id = "samai-floating-icon";
      icon.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      Object.assign(icon.style, {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)",
        boxShadow: "0 8px 24px rgba(79, 70, 229, 0.5), 0 0 20px rgba(79, 70, 229, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: "999999",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: "0.95",
        animation: "pulse-glow 3s ease-in-out infinite",
      });

      icon.onmouseenter = () => {
        icon.style.transform = "scale(1.15) rotate(5deg)";
        icon.style.opacity = "1";
        icon.style.boxShadow = "0 12px 32px rgba(79, 70, 229, 0.6), 0 0 30px rgba(79, 70, 229, 0.4)";
      };
      icon.onmouseleave = () => {
        icon.style.transform = "scale(1) rotate(0deg)";
        icon.style.opacity = "0.95";
        icon.style.boxShadow = "0 8px 24px rgba(79, 70, 229, 0.5), 0 0 20px rgba(79, 70, 229, 0.3)";
      };

      icon.onclick = () => {
        showSidePanel("", true); // Pass true to enable toggle behavior
      };

      document.body.appendChild(icon);
    };

    // Inject icon on load
    if (document.readyState === "complete") {
      injectFloatingIcon();
    } else {
      window.addEventListener("load", injectFloatingIcon);
    }

    // Handle messages from the background script using the message router
    browser.runtime.onMessage.addListener(
      async (message, sender, sendResponse) => {
        console.log("[SamAI Content] Received message:", message);

        if (!isContentScriptMessage(message)) {
          console.warn(
            "[SamAI Content] Received message with invalid structure:",
            message
          );
          return;
        }

        // Use the message router
        return routeMessage(message, sendResponse, lastInputElement);
      }
    );
  },
});