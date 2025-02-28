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
      background: linear-gradient(135deg, #1a1b2e, #0D0E16);
      box-shadow: -5px 0 15px rgba(0,0,0,0.2);
      padding: 24px;
      overflow-y: auto;
      z-index: 1000;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 1px solid rgba(255,255,255,0.1);
    `;
    document.body.appendChild(panel);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }
      
      .loading-dots span {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin: 0 4px;
        background: #4f46e5;
        border-radius: 50%;
        animation: pulse 1.4s infinite;

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
