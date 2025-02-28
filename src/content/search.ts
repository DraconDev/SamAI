import React from "react";
import { createRoot } from "react-dom/client";
import SearchPanel from "./SearchPanel";

export function showSidePanel(response: string | null) {
  // Create or get existing panel
  let panel = document.getElementById("samai-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "samai-panel";
    document.body.appendChild(panel);
  }

  // Create React root and render SearchPanel
  const root = createRoot(panel);
  root.render(
    React.createElement(SearchPanel, {
      response,
      onClose: () => {
        // Cleanup React root before removing element
        root.unmount();
        panel?.remove();
      },
    })
  );
}
