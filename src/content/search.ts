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
      width: 420px;
      height: 100vh;
      background: linear-gradient(135deg, #1a1b2e, #0D0E16);
      box-shadow: -5px 0 15px rgba(0,0,0,0.2);
      padding: 24px;
      overflow-y: auto;
      z-index: 1000;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 1px solid rgba(255,255,255,0.1);
      transform: translateX(100%);
    `;
    // Trigger entrance animation after a short delay
    document.body.appendChild(panel);
    requestAnimationFrame(() => {
      if (panel) {
        panel.style.transform = "translateX(0)";
      }
    });

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(0.95); opacity: 0.5; }
        50% { transform: scale(1); opacity: 0.8; }
        100% { transform: scale(0.95); opacity: 0.5; }
      }

      @keyframes ripple {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }

      @keyframes fadeInOut {
        0% { opacity: 0.4; }
        50% { opacity: 1; }
        100% { opacity: 0.4; }
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
      }

      .loading-indicator {
        position: relative;
        width: 40px;
        height: 40px;
        margin-bottom: 20px;
      }

      .loading-circle {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(135deg, #4f46e5, #818cf8);
        animation: pulse 2s ease-in-out infinite;
      }

      .loading-ripple {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid #4f46e5;
        animation: ripple 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      .loading-ripple:nth-child(2) {
        animation-delay: -0.5s;
        opacity: 0.6;
      }

      .loading-ripple:nth-child(3) {
        animation-delay: -1s;
        opacity: 0.3;
      }

      .loading-text {
        color: #818cf8;
        font-weight: 500;
        font-size: 0.9rem;
        letter-spacing: 0.5px;
        animation: fadeInOut 2s infinite;
        margin-top: 8px;
      }

      .markdown-content {
        color: #e2e8f0;
        line-height: 1.7;
      }

      .markdown-content p {
        margin: 1em 0;
      }

      .markdown-content strong {
        color: #818cf8;
        font-weight: 600;
      }

      .markdown-content ul, .markdown-content ol {
        margin: 1em 0;
        padding-left: 1.5em;
      }

      .markdown-content li {
        margin: 0.5em 0;
      }

      .markdown-content code {
        background: rgba(255,255,255,0.1);
        padding: 0.2em 0.4em;
        border-radius: 4px;
        font-family: 'Fira Code', monospace;
        font-size: 0.9em;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .content-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
      }

      .close-button {
        opacity: 0.6;
        transition: all 0.2s ease;
      }

      .close-button:hover {
        opacity: 1;
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(style);
  }

  // Update content
  panel.innerHTML = `
    <button id="samai-close" class="close-button" style="position: absolute; top: 20px; right: 20px; background: none; border: none; width: 32px; height: 32px; cursor: pointer; color: #e2e8f0; display: flex; align-items: center; justify-content: center; border-radius: 6px;">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
    <div style="margin-bottom: 24px;">
      <h3 style="margin: 0; font-size: 20px; font-weight: 600; background: linear-gradient(90deg, #818cf8, #4f46e5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; padding-right: 30px;">Sam AI Results</h3>
      <div style="height: 2px; width: 40px; background: #4f46e5; margin-top: 8px;"></div>
    </div>
    <div class="markdown-content content-fade-in" style="font-size: 15px;">
      ${
        response
          ? response
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/`(.*?)`/g, "<code>$1</code>")
              .replace(/\n\n/g, "</p><p>")
              .replace(/\n/g, "<br>")
          : `<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding-top: 80px;">
              <div class="loading-container" style="margin-top: -40px">
                <div class="loading-indicator">
                  <div class="loading-circle"></div>
                  <div class="loading-ripple"></div>
                  <div class="loading-ripple"></div>
                  <div class="loading-ripple"></div>
                </div>
                <div class="loading-text">Generating insights...</div>
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
