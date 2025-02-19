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

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  `;

  const remove = () => container.remove();
  closeButton.onclick = remove;
  container.appendChild(closeButton);

  document.body.appendChild(container);
  return { container, remove };
}

// Update container with loading state
export function showLoading(container: HTMLDivElement) {
  const loadingDiv = document.createElement('div');
  loadingDiv.style.cssText = `
    text-align: center;
    padding: 20px;
    color: #666;
  `;
  loadingDiv.innerHTML = 'Loading Gemini results...';

  // Clear existing content but keep the close button
  const closeButton = container.querySelector('button');
  container.innerHTML = '';
  container.appendChild(closeButton!);
  container.appendChild(loadingDiv);
}

// Update container with search results
export function displayResults(container: HTMLDivElement, result: SearchResult) {
  // Clear existing content but keep the close button
  const closeButton = container.querySelector('button');
  container.innerHTML = '';
  container.appendChild(closeButton!);

  const content = document.createElement('div');
  if (result.geminiResponse) {
    content.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #1a73e8; padding-right: 30px;">Gemini AI Results</h3>
      <div style="font-size: 14px; line-height: 1.6; color: #333;">
        ${result.geminiResponse.replace(/\n/g, '<br>')}
      </div>
    `;
  } else {
    content.innerHTML = '<div style="color: red; padding: 20px;">Error loading Gemini results</div>';
  }
  container.appendChild(content);
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
