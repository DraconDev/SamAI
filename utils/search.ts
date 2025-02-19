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
