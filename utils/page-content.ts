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
    console.log("[SamAI Content] extractPageContent called. Output format:", outputFormat);
    console.log("[SamAI Content] document.body.outerHTML length:", document.body.outerHTML.length);

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
            // Temporarily skip all filters except for empty text nodes for debugging
            if (!node.textContent?.trim()) {
              return NodeFilter.FILTER_REJECT;
            }
            console.log("[SamAI Content] Accepted node text:", node.textContent); // Log accepted text
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
      let nodeCount = 0; // Add node counter
      while ((node = walk.nextNode())) {
        nodeCount++; // Increment counter
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
      console.log("[SamAI Content] Total nodes processed by TreeWalker:", nodeCount); // Log total nodes
      console.log("[SamAI Content] Final extracted content length:", content.trim().length); // Log final length

      return content.trim();
    }
  } catch (error) {
    console.error("[SamAI Content] Error extracting page content:", error);
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
