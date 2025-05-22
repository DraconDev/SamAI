/**
 * Defines the output format for page content extraction.
 */
export type OutputFormat = "html" | "text";

/**
 * Extract visible text content or optimized HTML from a webpage
 * Filters out hidden elements and empty text nodes for text extraction
 */
export function extractPageContent(outputFormat: OutputFormat): string {
  try {
    if (outputFormat === "html") {
      // Return optimized HTML of the entire page
      const fullHtml = document.documentElement.outerHTML;
      return optimizeHtmlContent(fullHtml);
    } else {
      // Get all visible text, filtering out hidden elements and scripts
      const walk = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Get parent element
            let currentElement: HTMLElement | null = node.parentElement;
            if (!currentElement) return NodeFilter.FILTER_REJECT;

            // Ensure currentElement is not null for subsequent checks
            const parentElement = node.parentElement;
            if (!parentElement) return NodeFilter.FILTER_REJECT; // Should already be caught, but for type safety

            // Skip script and style tags
            if (
              parentElement.tagName === "SCRIPT" ||
              parentElement.tagName === "STYLE" ||
              parentElement.tagName === "NOSCRIPT"
            ) {
              return NodeFilter.FILTER_REJECT;
            }

            // Skip hidden elements
            const style = window.getComputedStyle(parentElement);
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              style.opacity === "0" ||
              style.pointerEvents === "none"
            ) {
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
        "ADDRESS",
        "ARTICLE",
        "ASIDE",
        "BLOCKQUOTE",
        "DETAILS",
        "DIALOG",
        "DD",
        "DIV",
        "DL",
        "DT",
        "FIELDSET",
        "FIGCAPTION",
        "FIGURE",
        "FOOTER",
        "FORM",
        "H1",
        "H2",
        "H3",
        "H4",
        "H5",
        "H6",
        "HEADER",
        "HGROUP",
        "HR",
        "LI",
        "MAIN",
        "NAV",
        "OL",
        "P",
        "PRE",
        "SECTION",
        "TABLE",
        "UL",
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
    }
  } catch (error) {
    console.error("Error extracting page content:", error);
    return ""; // Return empty string on error
  }
}

export function optimizeHtmlContent(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove script and style tags
  doc
    .querySelectorAll("script, style, noscript, link, meta")
    .forEach((el) => el.remove());

  // Remove comments
  const comments = doc.createTreeWalker(
    doc.documentElement,
    NodeFilter.SHOW_COMMENT,
    null
  );
  let node;
  while ((node = comments.nextNode())) {
    node.parentNode?.removeChild(node); // Use optional chaining for parentNode
  }

  return doc.documentElement.outerHTML; // Return the cleaned HTML
}
