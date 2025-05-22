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
            parent.tagName === "SCRIPT" ||
            parent.tagName === "STYLE" ||
            parent.tagName === "NOSCRIPT"
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip hidden elements
          const style = window.getComputedStyle(parent);
          if (style.display === "none" || style.visibility === "hidden") {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip empty text nodes
          if (!node.textContent?.trim()) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const blockElements = new Set([
      'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'DETAILS', 'DIALOG', 'DD', 'DIV', 'DL', 'DT',
      'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
      'HEADER', 'HGROUP', 'HR', 'LI', 'MAIN', 'NAV', 'OL', 'P', 'PRE', 'SECTION', 'TABLE', 'UL'
    ]);

    function isBlockElement(element: HTMLElement): boolean {
      return blockElements.has(element.tagName);
    }

    let content = "";
    let node;
    while ((node = walk.nextNode())) {
      const text = node.textContent?.trim() || "";
      if (text) {
        content += text;
        if (node.parentElement && isBlockElement(node.parentElement)) {
          content += "\n"; // Add newline for block elements
        } else {
          content += " "; // Add space for inline elements
        }
      }
    }

    return content.trim();
  } catch (error) {
    console.error("Error extracting page content:", error);
    return ""; // Return empty string on error
  }
}

export function optimizeHtmlContent(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove script and style tags
  doc.querySelectorAll('script, style, noscript, link, meta').forEach(el => el.remove());

  // Remove comments
  const comments = doc.createTreeWalker(doc.documentElement, NodeFilter.SHOW_COMMENT, null);
  let node;
  while ((node = comments.nextNode())) {
    node.remove();
  }

  return doc.documentElement.outerHTML; // Return the cleaned HTML
}
