import React from "react";
import { createRoot } from "react-dom/client";
import SearchPanel from "./SearchPanel";

function injectStyles() {
  const styleTag = document.createElement("style");
  styleTag.textContent = `
    #samai-container * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Markdown styles */
    #samai-container pre {
      background: #1a1b2e;
      border: 1px solid rgba(46, 47, 62, 0.5);

    @keyframes slideOut {
      from { transform: translateX(0); }
      to { transform: translateX(100%); }
    }

    .animate-slide-in {
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .animate-slide-out {
      animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }

    .animate-spin {
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleTag);
}

export function showSidePanel(response: string | null) {
  // Inject styles if not already present
  if (!document.querySelector("#samai-styles")) {
    injectStyles();
  }

  // Create or get existing panel container
  let panelContainer = document.getElementById("samai-container");
  if (!panelContainer) {
    panelContainer = document.createElement("div");
    panelContainer.id = "samai-container";
    document.body.appendChild(panelContainer);
  }

  // Initialize React root and render
  const root = createRoot(panelContainer);
  root.render(
    React.createElement(SearchPanel, {
      response,
      onClose: () => {
        // Cleanup React root before removing container
        root.unmount();
        panelContainer?.remove();
      },
    })
  );
}
