import { searchSettingsStore } from "@/utils/store";
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import SearchPanel from "@/src/content/SearchPanel";

let samaiRoot: Root | null = null;
let samaiPanelContainer: HTMLDivElement | null = null;

export async function showSidePanel(
  response: string | null,
  toggleIfOpen: boolean = false
) {
  console.log("[SamAI Debug] showSidePanel called", { response, toggleIfOpen });

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
  
  // Apply inline styles to ensure the panel is visible
  Object.assign(samaiPanelContainer.style, {
    position: "fixed",
    top: "0px",
    right: "0px",
    width: "420px",
    height: "100vh",
    zIndex: "2147483647",
    pointerEvents: "auto",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#f1f5f9",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    backdropFilter: "blur(24px)",
    borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column"
  });
  
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
