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
      width: 430px;
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
      @keyframes rotate {
        100% { transform: rotate(360deg); }
      }

      @keyframes dash {
        0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
        50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
        100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
      }

      @keyframes fadeInOut {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .loading-indicator {
        position: relative;
        width: 50px;
        height: 50px;
        margin-bottom: 16px;
      }

      .loading-indicator svg {
        width: 100%;
        height: 100%;
        transform-origin: center;
        animation: rotate 2s linear infinite;
      }

      .loading-indicator svg path {
        animation: dash 1.5s ease-in-out infinite;
      }

      .loading-text {
        color: #818cf8;
        font-weight: 500;
        font-size: 0.9rem;
        letter-spacing: 0.5px;
        animation: fadeInOut 2s ease-in-out infinite;
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
                  <svg viewBox="0 0 50 50">
                    <path
                      d="M25,25 m-20,0 a20,20 0 1,1 40,0 a20,20 0 1,1 -40,0"
                      fill="none"
                      stroke="url(#gradient)"
                      stroke-width="3"
                      stroke-linecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient">
                        <stop offset="0%" stop-color="#4f46e5" />
                        <stop offset="100%" stop-color="#818cf8" />
                      </linearGradient>
                    </defs>
                  </svg>
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
