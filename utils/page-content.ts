/**
 * Extract visible text content from a webpage
 * Filters out hidden elements and empty text nodes
 */
export function extractPageContent(): string {
  try {
    // Get all visible text, filtering out hidden elements and scripts
    const walk = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Get parent element
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          // Skip script and style tags
          if (
            parent.tagName === 'SCRIPT' ||
            parent.tagName === 'STYLE' ||
            parent.tagName === 'NOSCRIPT'
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip hidden elements
          const style = window.getComputedStyle(parent);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip empty text nodes
          if (!node.textContent?.trim()) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let content = '';
    let node;
    while ((node = walk.nextNode())) {
      const text = node.textContent?.trim() || '';
      if (text) {
        content += text + ' ';
      }
    }

    return content.trim();
  } catch (error) {
    console.error('Error extracting page content:', error);
    return document.body.innerText; // Fallback to simple innerText
  }
}
