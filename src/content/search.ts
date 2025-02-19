// Types
export interface SearchContainer {
  container: HTMLDivElement;
  remove: () => void;
}

export interface SearchResult {
  query: string;
  geminiResponse: string | null;
}

// Create and handle the search results container
export function createSearchContainer(): SearchContainer {
  const container = document.createElement('div');
  container.id = 'samai-gemini-results';
  container.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 300px;
    height: 100vh;
    background: white;
    box-shadow: -2px 0 5px rgba(0,0,0,0.1);
    padding: 20px;
    overflow-y: auto;
    z-index: 1000;
    font-family: Arial, sans-serif;
  `;

  // Initial content
  container.innerHTML = `
    <button style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
    <div id="gemini-content">
      <h3 style="margin: 0 0 15px 0; color: #1a73e8; padding-right: 30px;">Gemini AI Results</h3>
      <div style="font-size: 14px; line-height: 1.6; color: #666; text-align: center;">
        Getting AI insights...
      </div>
    </div>
  `;

  // Add close button handler
  const closeButton = container.querySelector('button');
  const remove = () => container.remove();
  if (closeButton) closeButton.onclick = remove;

  document.body.appendChild(container);
  return { container, remove };
}

// Update container with search results
export function displayResults(container: HTMLDivElement, result: SearchResult) {
  const content = container.querySelector('#gemini-content');
  if (!content) return;

  if (result.geminiResponse) {
    const formattedResponse = result.geminiResponse
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    
    content.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #1a73e8; padding-right: 30px;">Gemini AI Results</h3>
      <div style="font-size: 14px; line-height: 1.6; color: #333;">
        ${formattedResponse}
      </div>
    `;
  } else {
    content.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #1a73e8; padding-right: 30px;">Gemini AI Results</h3>
      <div style="color: red; padding: 20px;">
        Error loading results for: ${result.query}
      </div>
    `;
  }
}

// Extract search query from URL
export function extractSearchQuery(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.google.com' && urlObj.pathname === '/search') {
      return urlObj.searchParams.get('q');
    }
    return null;
  } catch {
    return null;
  }
}
