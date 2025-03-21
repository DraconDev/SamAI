import React from "react";
import { createRoot } from "react-dom/client";
import SearchPanel from "./SearchPanel";

function injectStyles() {
  const styleTag = document.createElement("style");
  styleTag.id = "samai-styles";
  styleTag.textContent = `
    /* Reset container styles */
    #samai-container {
      all: initial;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #e2e8f0;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Markdown styles */
    #samai-container pre {
      background: #1a1b2e;
      border: 1px solid rgba(46, 47, 62, 0.5);
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 1rem 0;
      overflow-x: auto;
    }

    #samai-container code {
      font-family: 'Fira Code', monospace;
      font-size: 0.9em;
      background: rgba(46, 47, 62, 0.5);
      padding: 0.2em 0.4em;
      border-radius: 0.25rem;
    }

    #samai-container p {
      margin: 1em 0;
      line-height: 1.7;
    }

    #samai-container h1, #samai-container h2, #samai-container h3 {
      font-weight: 600;
      margin: 1.5em 0 0.5em;
      color: #e2e8f0;
    }

    #samai-container ul, #samai-container ol {
      margin: 1em 0;
      padding-left: 1.5em;
      list-style-type: disc;
    }

    #samai-container ol {
      list-style-type: decimal;
    }

    #samai-container li {
      margin: 0.5em 0;
    }

    #samai-container a {
      color: #818cf8;
      text-decoration: underline;
    }

    #samai-container a:hover {
      color: #4f46e5;
    }

    #samai-container strong {
      color: #818cf8;
      font-weight: 600;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

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
  // Remove existing panel if present
  const existingPanel = document.getElementById("samai-container");
  if (existingPanel) {
    const root = createRoot(existingPanel);
    root.unmount();
    existingPanel.remove();
  }

  // Create new panel container
  const panelContainer = document.createElement("div");
  panelContainer.id = "samai-container";
  document.body.appendChild(panelContainer);

  // Inject styles if not already present
  if (!document.querySelector("#samai-styles")) {
    injectStyles();
  }

  // Initialize React root and render
  const root = createRoot(panelContainer);
  root.render(
    React.createElement(SearchPanel, {
      response,
      onClose: () => {
        // Cleanup React root before removing container
        root.unmount();
        panelContainer.remove();
      },
    })
  );
}
