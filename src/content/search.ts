import React from "react";
import { createRoot } from "react-dom/client";
import SearchPanel from "./SearchPanel";

export function showSidePanel(response: string | null) {
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
