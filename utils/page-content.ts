import browser from "webextension-polyfill";

/**
 * Defines the output format for page content extraction.
 */
export type OutputFormat = "html" | "text";
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

  // Get the cleaned HTML string
  let cleanedHtml = doc.documentElement.outerHTML;

  // Collapse multiple whitespace characters into a single space
  cleanedHtml = cleanedHtml.replace(/\s+/g, " ").trim();

  return cleanedHtml; // Return the cleaned HTML
}

export const extractPageContentAsync = async (format: OutputFormat, fresh: boolean = false): Promise<string> => {
  try {
    if (!fresh) {
      const result = await browser.storage.local.get([
        'pageBodyText',
        'pageOptimizedHtml',
      ]);
      
      const cached = (format === "html" ? result.pageOptimizedHtml : result.pageBodyText) as string;
      if (cached) {
        console.log("[PageContent] Using cached content:", cached.length);
        return cached;
      }
    }

    console.log("[PageContent] Extracting fresh content...");
    let content: string;

    if (format === "html") {
      const fullHtml = document.documentElement.outerHTML;
      content = optimizeHtmlContent(fullHtml);
    } else {
      content = document.body.innerText.trim();
    }

    if (!content) {
      throw new Error("No readable content found on this page.");
    }

    const storageKey = format === "html" ? "pageOptimizedHtml" : "pageBodyText";
    await browser.storage.local.set({ [storageKey]: content });
    
    console.log("[PageContent] Fresh content extracted:", content.length);
