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
  // If toggle is requested and panel exists, close it and return
  if (toggleIfOpen && samaiPanelContainer) {
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

  // Create new panel container with Tailwind classes
  samaiPanelContainer = document.createElement("div");
  samaiPanelContainer.id = "samai-container";
  samaiPanelContainer.className = `
    fixed top-0 right-0 w-[420px] h-screen z-[2147483647] pointer-events-auto
    font-inter text-slate-100 antialiased
    bg-gradient-to-br from-slate-900 to-slate-800
    backdrop-blur-xl border-l border-white/10
    shadow-2xl
  `;
  document.body.appendChild(samaiPanelContainer);

  // Initialize React root
  samaiRoot = createRoot(samaiPanelContainer);

  // Get current output format from store
  const settings = await searchSettingsStore.getValue();
  const outputFormat = settings.outputFormat;

  // Render the SearchPanel with a close handler
  if (samaiRoot) {
    samaiRoot.render(
      React.createElement(SearchPanel, {
        response,
        outputFormat,
        onClose: () => {
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
  }
}
