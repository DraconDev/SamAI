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
    console.log(
      "[SamAI Content] extractPageContent called. Output format:",
      outputFormat
    );
    console.log(
      "[SamAI Content] document.body.outerHTML length:",
      document.body.outerHTML.length
    );

    if (outputFormat === "html") {
      // Return optimized HTML of the entire page
      const fullHtml = document.documentElement.outerHTML;
      return optimizeHtmlContent(fullHtml);
    } else {
      // Use innerText for simpler text extraction for debugging
      const content = document.body.innerText;
      console.log(
        "[SamAI Content] Extracted content using innerText. Length:",
        content.length
      );
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

  // Remove script, style, and other non-content/embedding tags
  doc
    .querySelectorAll(
      "script, style, noscript, link, meta, iframe, svg, canvas, audio, video, picture, source, map, area, track, embed, object"
    )
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

  // Remove irrelevant attributes from all elements
  const attributesToRemove = [
    "id",
    "class",
    "style",
    "data-", // Matches all data-* attributes
    "aria-", // Matches all aria-* attributes
    "tabindex",
    "role",
    "onclick",
    "onmouseover",
    "onload",
    "width",
    "height",
    "src",
    "srcset",
    "sizes",
    "loading",
    "decoding",
    "rel",
    "target",
    "title", // Can be relevant, but often noise for AI summarization
    "alt", // Images are removed, so alt is not needed
    "href", // Keep for <a> tags, remove for others if present
    "value", // Keep for input elements, remove for others
  ];

  doc.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attr) => {
      const attrName = attr.name.toLowerCase();
      let shouldRemove = false;

      for (const prefix of attributesToRemove) {
        if (prefix.endsWith("-")) {
          if (attrName.startsWith(prefix)) {
            shouldRemove = true;
            break;
          }
        } else if (attrName === prefix) {
          // Special handling for 'href' and 'value'
          if (attrName === "href" && element.tagName.toLowerCase() === "a") {
            shouldRemove = false; // Keep href for anchor tags
          } else if (
            attrName === "value" &&
            (element.tagName.toLowerCase() === "input" ||
              element.tagName.toLowerCase() === "textarea" ||
              element.tagName.toLowerCase() === "select")
          ) {
            shouldRemove = false; // Keep value for input elements
          } else {
            shouldRemove = true;
          }
          break;
        }
      }

      if (shouldRemove) {
        element.removeAttribute(attr.name);
      }
    });
  });

  // Collapse multiple whitespace characters into a single space
  // This is a simple text-based replacement, not DOM manipulation
  let cleanedHtml = doc.documentElement.outerHTML;
  cleanedHtml = cleanedHtml.replace(/\s+/g, " ").trim();

  return cleanedHtml; // Return the cleaned HTML
}
