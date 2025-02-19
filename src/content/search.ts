export function showSidePanel(response: string | null) {
  // Create or get existing panel
  let panel = document.getElementById("samai-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "samai-panel";
    panel.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 300px;
      height: 100vh;
      background: black;
      box-shadow: -2px 0 5px rgba(0,0,0,0.1);
      padding: 20px;
      overflow-y: auto;
      z-index: 1000;
      font-family: Arial, sans-serif;
    `;
    document.body.appendChild(panel);
  }

  // Update content
  panel.innerHTML = `
    <button style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;" onclick="this.parentElement.remove()">×</button>
    <h3 style="margin: 0 0 15px 0; color: #1a73e8; padding-right: 30px;">Gemini AI Results</h3>
    <div style="font-size: 14px; line-height: 1.6;">
      ${
        response
          ? response
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/\n/g, "<br>")
          : '<div style="color: #666; text-align: center;">Getting AI insights...</div>'
      }
    </div>
  `;
}
