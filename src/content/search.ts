import SearchPanel from "@/src/content/SearchPanel";
import { searchSettingsStore } from "@/utils/store";
import React from "react";
import { createRoot, type Root } from "react-dom/client";

let samaiRoot: Root | null = null;
let samaiPanelContainer: HTMLDivElement | null = null;

export async function showSidePanel(
  response: string | null,
  toggleIfOpen: boolean = false
) {
  console.log("[SamAI Debug] showSidePanel called", { response, toggleIfOpen });

  // Inject CSS animations and styles if not already present
  if (!document.getElementById("samai-animations")) {
    const style = document.createElement("style");
    style.id = "samai-animations";
    style.textContent = `
      @keyframes samai-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes samai-fade-in {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes samai-slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      #samai-container * {
        box-sizing: border-box;
      }
      #samai-container ::-webkit-scrollbar {
        width: 6px;
      }
      #samai-container ::-webkit-scrollbar-track {
        background: rgba(30, 41, 59, 0.5);
        border-radius: 3px;
      }
      #samai-container ::-webkit-scrollbar-thumb {
        background: #475569;
        border-radius: 3px;
      }
      #samai-container ::-webkit-scrollbar-thumb:hover {
        background: #64748b;
      }
    `;
    document.head.appendChild(style);
  }

  // If toggle is requested and panel exists, close it and return
  if (toggleIfOpen && samaiPanelContainer) {
    console.log("[SamAI Debug] Toggling off panel");
    if (samaiRoot) {
      samaiRoot.unmount();
      samaiRoot = null;
    }
    if (samaiPanelContainer) {
      samaiPanelContainer.remove();
      samaiPanelContainer = null;
    }
    return;
  }

  // If panel already exists, just update the content
  if (samaiRoot && samaiPanelContainer) {
    console.log("[SamAI Debug] Panel exists, updating content");
    const settings = await searchSettingsStore.getValue();
    const outputFormat = settings.outputFormat;
    samaiRoot.render(
      React.createElement(SearchPanel, {
        response,
        outputFormat,
        onClose: () => {
          if (samaiRoot) {
            samaiRoot.unmount();
            samaiRoot = null;
          }
          if (samaiPanelContainer) {
            samaiPanelContainer.remove();
            samaiPanelContainer = null;
          }
        },
      })
    );
    return;
  }

  console.log("[SamAI Debug] Creating new panel");

  // Create new panel container with inline styles (no Tailwind dependency)
  samaiPanelContainer = document.createElement("div");
  samaiPanelContainer.id = "samai-container";

  // Apply inline styles to ensure the panel is visible with proper z-index hierarchy
  Object.assign(samaiPanelContainer.style, {
    position: "fixed",
    top: "0px",
    right: "0px",
    width: "420px",
    height: "100vh",
    maxHeight: "100vh",
    zIndex: "2147483647", // Maximum safe z-index for side panel
    pointerEvents: "auto",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#f1f5f9",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    backdropFilter: "blur(24px)",
    borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  });

  // Ensure floating icon is hidden when panel is open
  const floatingIcon = document.getElementById("samai-floating-icon");
  if (floatingIcon) {
    floatingIcon.style.display = "none";
    floatingIcon.style.zIndex = "1"; // Push it behind when panel is open
  }

  document.body.appendChild(samaiPanelContainer);
  console.log("[SamAI Debug] Panel container created and appended");

  // Initialize React root
  samaiRoot = createRoot(samaiPanelContainer);
  console.log("[SamAI Debug] React root initialized");

  // Get current output format from store
  const settings = await searchSettingsStore.getValue();
  const outputFormat = settings.outputFormat;

  // Render the SearchPanel with a close handler
  if (samaiRoot) {
    console.log("[SamAI Debug] Rendering SearchPanel...");
    samaiRoot.render(
      React.createElement(SearchPanel, {
        response,
        outputFormat,
        onClose: () => {
          console.log("[SamAI Debug] Panel close callback triggered");
          // Cleanup React root and container
          if (samaiRoot) {
            samaiRoot.unmount();
            samaiRoot = null;
          }
          if (samaiPanelContainer) {
            samaiPanelContainer.remove();
            samaiPanelContainer = null;
          }
        },
      })
    );
    console.log("[SamAI Debug] SearchPanel rendered");
  }
}
