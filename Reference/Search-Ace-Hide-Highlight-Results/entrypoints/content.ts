import { defineContentScript } from "wxt/sandbox";
import { store } from "@/utils/store";

export default defineContentScript({
  matches: ["*://www.google.com/*", "*://www.google.co.uk/*"],
  main() {
    // Only run on Google search results pages
    if (!window.location.href.includes("search?")) return;

    const processResults = async () => {
      const { hiddenResults, highlightedResults, suspended } =
        await store.getValue();
      if (suspended) return;

      // Get all search result elements - try multiple selectors for different Google layouts
      const results = document.querySelectorAll("div.g, .g, .tF2Cxc, .MjjYud");

      results.forEach((result) => {
        const resultElement = result as HTMLElement;

        // Check if this result has already been processed
        if (resultElement.classList.contains("processed-result")) {
          return;
        }

        const link = resultElement.querySelector("a[href]");
        if (!link) return;

        // Check if the link is within an h3, which is typical for main search results
        // if (!link.closest("h3")) {
        //   console.log("Skipping non-search result element:", resultElement);
        //   return;
        // }

        const url = link.getAttribute("href");
        if (!url) return;

        // Extract the domain from the URL
        let domain = "";
        try {
          const urlObject = new URL(url);
          domain = urlObject.hostname;
        } catch (e) {
          console.error("Invalid URL:", url, e);
          return; // Skip invalid URLs
        }

        console.log("Processing result with URL:", url, "Domain:", domain);

        // Check if buttons already exist for this result
        if (resultElement.querySelector(".search-result-actions")) {
          // Mark as processed even if buttons existed from a previous run
          resultElement.classList.add("processed-result");
          return;
        }

        // Check if domain matches any hidden patterns
        for (const pattern in hiddenResults) {
          if (domain.includes(pattern)) {
            resultElement.style.display = "none";
            // Mark as processed even if hidden
            resultElement.classList.add("processed-result");
            return;
          }
        }

        // Add action buttons container
        const actions = document.createElement("div");
        actions.classList.add("search-result-actions"); // Add a class for identification
        actions.style.display = "flex";
        actions.style.flexDirection = "column"; // Arrange items in a column
        actions.style.gap = "4px"; // Adjust gap for vertical spacing
        actions.style.marginTop = "4px";

        // Add highlight button
        const highlightBtn = document.createElement("button");
        highlightBtn.innerHTML = "☆"; // Minimalistic star outline
        highlightBtn.title = "Highlight with default color";
        highlightBtn.style.cursor = "pointer";
        highlightBtn.style.background = "none";
        highlightBtn.style.border = "none";
        highlightBtn.style.padding = "0";
        highlightBtn.style.fontSize = "18px"; // Make icon a little bigger
        highlightBtn.onclick = async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const { defaultHighlightColor, highlightedResults } =
            await store.getValue();
          const current = await store.getValue();
          const resultElement = highlightBtn.closest(
            "div.g, .g, .tF2Cxc, .MjjYud"
          ) as HTMLElement;

          // Extract the domain from the URL
          let domain = "";
          try {
            const urlObject = new URL(url);
            domain = urlObject.hostname;
          } catch (e) {
            console.error("Invalid URL:", url, e);
            return; // Skip invalid URLs
          }

          if (highlightedResults && highlightedResults[domain]) {
            // If already highlighted, remove highlight
            const newHighlightedResults = { ...highlightedResults };
            delete newHighlightedResults[domain];
            await store.setValue({
              ...current,
              highlightedResults: newHighlightedResults,
            });
            if (resultElement) {
              resultElement.style.borderLeft = "";
              resultElement.style.paddingLeft = "";
            }
          } else {
            // If not highlighted, add highlight
            await store.setValue({
              ...current,
              highlightedResults: {
                ...current.highlightedResults,
                [domain]: defaultHighlightColor,
              },
            });
            if (resultElement) {
              resultElement.style.borderLeft = `3px solid ${defaultHighlightColor}`;
              resultElement.style.paddingLeft = "8px";
            }
          }
          // Store change listener will re-process and apply styles
        };
        actions.appendChild(highlightBtn);

        // Add hide button
        const hideBtn = document.createElement("button");
        hideBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        `;
        hideBtn.title = "Hide domain";
        hideBtn.style.cursor = "pointer";
        hideBtn.style.background = "none";
        hideBtn.style.border = "none";
        hideBtn.style.padding = "0";
        hideBtn.style.fontSize = "18px"; // Make icon a little bigger
        hideBtn.onclick = async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const current = await store.getValue();

          // Extract the domain from the URL
          let domain = "";
          try {
            const urlObject = new URL(url);
            domain = urlObject.hostname;
          } catch (e) {
            console.error("Invalid URL:", url, e);
            return; // Skip invalid URLs
          }

          await store.setValue({
            ...current,
            hiddenResults: {
              ...current.hiddenResults,
              [domain]: true,
            },
          });
          // Hide the element immediately
          const clickedElement = hideBtn.closest(
            "div.g, .g, .tF2Cxc, .MjjYud"
          ) as HTMLElement;
          if (clickedElement) {
            clickedElement.style.display = "none";
          }
          // Store change listener will re-process and apply styles
        };
        actions.appendChild(hideBtn);

        // Position buttons to the right of the result using absolute positioning within the main result element
        // Use existing resultElement reference
        resultElement.style.position = "relative";
        (actions as HTMLElement).style.position = "absolute";
        (actions as HTMLElement).style.right = "-26px";
        (actions as HTMLElement).style.top = "0";
        (actions as HTMLElement).style.zIndex = "1000";
        resultElement.appendChild(actions);

        // Check if domain matches any highlighted patterns
        for (const [pattern, color] of Object.entries(highlightedResults)) {
          if (domain.includes(pattern)) {
            const resultElement = result as HTMLElement;
            // Check if an ancestor already has a highlight border
            if (resultElement.closest('[style*="border-left:"]')) {
              console.log(
                "Skipping highlight on nested element:",
                resultElement
              );
              break; // Skip applying highlight to this element
            }
            // Remove existing highlight before applying a new one to prevent double borders
            resultElement.style.borderLeft = "";
            resultElement.style.paddingLeft = "";
            resultElement.style.borderLeft = `3px solid ${color}`;
            resultElement.style.paddingLeft = "8px";
            break;
          }
        }

        // Mark the result as processed
        resultElement.classList.add("processed-result");
      });
    };

    // Run initially
    processResults();

    // Watch for store changes
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "sync" && changes["sync:store"]) {
        processResults();
      }
    });

    // Watch for dynamic result loading
    const observer = new MutationObserver(processResults);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },
});
