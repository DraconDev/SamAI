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
      width: 450px;
      height: 100vh;
      background: #0D0E16;
      box-shadow: -2px 0 5px rgba(0,0,0,0.1);
      padding: 20px;
      overflow-y: auto;
      z-index: 1000;
      font-family: Arial, sans-serif;
      transition: transform 0.3s ease-out;
    `;
    document.body.appendChild(panel);

    // Add loading animation styles
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 0.4; }
        50% { opacity: 1; }
        100% { opacity: 0.4; }
      }
      .loading-dots span {
        animation: pulse 1.4s infinite;
        animation-fill-mode: both;
      }
      .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
      .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
    `;
    document.head.appendChild(style);
  }

  // Update content
  panel.innerHTML = `
    <button id="samai-close" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
    <h3 style="margin: 0 0 15px 0; color: #1a73e8; padding-right: 30px;">Sam AI Results</h3>
    <div style="font-size: 14px; line-height: 1.6; color: #fff;">
      ${
        response
          ? response
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/\n/g, "<br>")
          : `<div style="color: #666; text-align: center;">
              <div style="margin-bottom: 10px;">Getting AI insights</div>
              <div class="loading-dots" style="font-size: 24px;">
                <span>•</span><span>•</span><span>•</span>
              </div>
             </div>`
      }
    </div>
  `;

  // Add click handler for close button with animation
  const closeButton = document.getElementById("samai-close");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      panel.style.transform = "translateX(100%)";
      setTimeout(() => {
        panel.remove();
      }, 300); // Match the transition duration
    });
  }
}
