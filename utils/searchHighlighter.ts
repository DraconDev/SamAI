import type { HighlightPattern } from "./store";
import { highlightPatternsStore, searchSettingsStore } from "./store";

interface HighlightSettings {
  autoHighlight: boolean;
  highlightOpacity: number;
  enableHighlighting: boolean;
}

interface Message {
  type: string;
  enabled?: boolean;
  enableHighlighting?: boolean;
}

class SearchHighlighter {
  private settings: HighlightSettings = {
    autoHighlight: true,
    highlightOpacity: 0.3,
    enableHighlighting: true,
  };

  private patterns: HighlightPattern[] = [];

  constructor() {
    this.loadSettings();
    this.setupMessageListener();
    this.initImmediate();
  }

  private async initImmediate() {
    // Process results immediately when initialized
    setTimeout(() => this.processResults(), 1000);
  }

  private async loadSettings() {
    try {
      // Load patterns from sync store
      const patternsStore = await highlightPatternsStore.getValue();
      this.patterns = patternsStore.patterns;

      // Load highlight settings from searchSettingsStore
      const searchSettings = await searchSettingsStore.getValue();
      this.settings.autoHighlight = searchSettings.autoHighlight;
      this.settings.highlightOpacity = searchSettings.highlightOpacity;
      this.settings.enableHighlighting = searchSettings.enableHighlighting;
    } catch (error) {
      console.error("Error loading search highlight settings:", error);
    }
  }

  private setupMessageListener() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      try {
        const typedMessage = message as Message;
        
        if (typedMessage.type === "SAMAI_SEARCH_SETTINGS_UPDATED") {
          this.loadSettings().then(() => {
            this.processResults();
          });
          return true;
        }

        if (typedMessage.type === "TOGGLE_AUTO_HIGHLIGHT" && typedMessage.enabled !== undefined) {
          this.settings.autoHighlight = typedMessage.enabled;
          if (typedMessage.enabled) {
            this.processResults();
          } else {
            this.clearHighlights();
          }
          return true;
        }

        if (typedMessage.type === "TOGGLE_ENABLE_HIGHLIGHTING" && typedMessage.enabled !== undefined) {
          this.settings.enableHighlighting = typedMessage.enabled;
          if (!typedMessage.enabled) {
            this.clearHighlights();
          } else {
            this.processResults();
          }
          return true;
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
      
      return undefined;
    });
  }

  public processResults() {
    console.log("[SamAI Highlighter] Starting processResults", {
      autoHighlight: this.settings.autoHighlight,
      enableHighlighting: this.settings.enableHighlighting,
      patternsCount: this.patterns.length,
      patterns: this.patterns,
      currentURL: window.location.href,
      isSearchPage: this.isSearchResultsPage()
    });

    // Only process on search results pages
    if (!this.isSearchResultsPage()) {
      console.log("[SamAI Highlighter] Not a search results page, skipping");
      return;
    }

    // If highlighting is disabled, clear any existing highlights and return
    if (!this.settings.enableHighlighting) {
      console.log("[SamAI Highlighter] Highlighting disabled, clearing highlights");
      this.clearHighlights();
      return;
    }

    // Get all search result elements - try multiple selectors for different search engines
    const results = this.getSearchResultElements();
    console.log("[SamAI Highlighter] Found search results:", results.length);
    
    results.forEach((result) => {
      const resultElement = result as HTMLElement;
      
      // Check if this result has already been processed
      if (resultElement.classList.contains("samai-processed-result")) {
        return;
      }

      const link = resultElement.querySelector("a[href]");
      if (!link) return;

      const url = link.getAttribute("href");
      if (!url) return;

      // Extract the domain from the URL
      let domain = "";
      try {
        const urlObject = new URL(url);
        domain = urlObject.hostname;
      } catch (e) {
        console.error("[SamAI Highlighter] Invalid URL:", url, e);
        return;
      }

      console.log("[SamAI Highlighter] Processing result with URL:", url, "Domain:", domain);

      // Check if action buttons already exist for this result
      if (resultElement.querySelector(".samai-search-result-actions")) {
        resultElement.classList.add("samai-processed-result");
        return;
      }

      // Add action buttons container
      const actions = document.createElement("div");
      actions.className = "samai-search-result-actions";
      actions.style.display = "flex";
      actions.style.flexDirection = "column";
      actions.style.gap = "4px";
      actions.style.marginTop = "4px";

      // Create color selection buttons
      const colors = [
        { name: "Red", color: "#dc2626", bg: "rgba(220, 38, 38, 0.1)", border: "#dc2626" },
        { name: "Green", color: "#059669", bg: "rgba(5, 150, 105, 0.1)", border: "#059669" },
        { name: "Blue", color: "#4f46e5", bg: "rgba(79, 70, 229, 0.1)", border: "#4f46e5" }
      ];

      colors.forEach(colorConfig => {
        const colorBtn = document.createElement("button");
        colorBtn.innerHTML = `
          <div style="
            width: 16px;
            height: 16px;
            background: ${colorConfig.color};
            border-radius: 50%;
            border: 1px solid ${colorConfig.border};
            opacity: 0.8;
          "></div>
        `;
        colorBtn.title = `Highlight ${colorConfig.name.toLowerCase()} - ${domain}`;
        colorBtn.style.cursor = "pointer";
        colorBtn.style.background = "none";
        colorBtn.style.border = "none";
        colorBtn.style.padding = "2px";
        colorBtn.style.fontSize = "16px";
        colorBtn.style.color = colorConfig.color;
        colorBtn.style.borderRadius = "50%";
        colorBtn.style.transition = "all 0.2s";
        colorBtn.style.width = "24px";
        colorBtn.style.height = "24px";
        colorBtn.style.display = "flex";
        colorBtn.style.alignItems = "center";
        colorBtn.style.justifyContent = "center";
        
        colorBtn.onclick = async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const currentPatterns = this.patterns.slice();
          const existingPattern = currentPatterns.find(p =>
            p.enabled && domain.includes(p.pattern.toLowerCase())
          );
          
          if (existingPattern) {
            if (existingPattern.color === colorConfig.color) {
              // Same color clicked - toggle off (remove highlight)
              const updatedPatterns = currentPatterns.filter(p => p.id !== existingPattern.id);
              this.updatePatterns(updatedPatterns);
              colorBtn.style.background = "none";
              console.log("[SamAI Highlighter] Removed highlight for domain:", domain);
            } else {
              // Different color - update existing pattern color
              const updatedPatterns = currentPatterns.map(p =>
                p.id === existingPattern.id ? { ...p, color: colorConfig.color } : p
              );
              this.updatePatterns(updatedPatterns);
              colorBtn.style.background = colorConfig.bg;
              console.log("[SamAI Highlighter] Updated highlight for domain to", colorConfig.name, ":", domain);
            }
          } else {
            // Add new highlight pattern
            const newPattern: HighlightPattern = {
              id: Date.now().toString(),
              pattern: domain,
              color: colorConfig.color,
              description: `${colorConfig.name} highlight: ${domain}`,
              enabled: true,
              category: colorConfig.name === "Red" ? "important" : colorConfig.name === "Green" ? "favorite" : "default",
            };
            const updatedPatterns = [...currentPatterns, newPattern];
            this.updatePatterns(updatedPatterns);
            colorBtn.style.background = colorConfig.bg;
            console.log("[SamAI Highlighter] Added", colorConfig.name, "highlight for domain:", domain);
          }
          
          this.applyPatternHighlighting(resultElement, domain);
        };
        
        actions.appendChild(colorBtn);
      });

      // Add hide button - more prominent styling
      const hideBtn = document.createElement("button");
      hideBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
          <path d="M3 3L21 21"/>
        </svg>
      `;
      hideBtn.title = "Hide this domain";
      hideBtn.style.cursor = "pointer";
      hideBtn.style.background = "rgba(220, 38, 38, 0.1)";
      hideBtn.style.border = "1px solid rgba(220, 38, 38, 0.3)";
      hideBtn.style.padding = "4px";
      hideBtn.style.fontSize = "16px";
      hideBtn.style.color = "#dc2626";
      hideBtn.style.borderRadius = "6px";
      hideBtn.style.transition = "all 0.2s";
      hideBtn.style.width = "24px";
      hideBtn.style.height = "24px";
      hideBtn.style.display = "flex";
      hideBtn.style.alignItems = "center";
      hideBtn.style.justifyContent = "center";
      
      hideBtn.onmouseenter = () => {
        hideBtn.style.background = "rgba(220, 38, 38, 0.2)";
        hideBtn.style.borderColor = "#dc2626";
        hideBtn.style.transform = "scale(1.1)";
      };
      
      hideBtn.onmouseleave = () => {
        hideBtn.style.background = "rgba(220, 38, 38, 0.1)";
        hideBtn.style.borderColor = "rgba(220, 38, 38, 0.3)";
        hideBtn.style.transform = "scale(1)";
      };
      
      hideBtn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log("[SamAI Highlighter] Hiding result for domain:", domain);
        
        // Add to hidden patterns
        const hiddenPattern: HighlightPattern = {
          id: `hidden-${Date.now()}`,
          pattern: domain,
          color: "#000000",
          description: `Hidden: ${domain}`,
          enabled: true,
          category: "default",
        };
        
        const updatedPatterns = [...this.patterns, hiddenPattern];
        this.updatePatterns(updatedPatterns);
        
        // Hide the element immediately
        resultElement.style.display = "none";
      };
      
      actions.appendChild(hideBtn);

      // Position buttons to the right of the result
      resultElement.style.position = "relative";
      (actions as HTMLElement).style.position = "absolute";
      (actions as HTMLElement).style.right = "-55px";
      (actions as HTMLElement).style.top = "4px";
      (actions as HTMLElement).style.zIndex = "1000";
      resultElement.appendChild(actions);

      // Apply existing highlights
      this.applyPatternHighlighting(resultElement, domain);

      // Mark as processed
      resultElement.classList.add("samai-processed-result");
    });
  }

  private async updatePatterns(newPatterns: HighlightPattern[]) {
    this.patterns = newPatterns;
    
    // Save to sync store for proper cross-tab synchronization
    try {
      await highlightPatternsStore.setValue({ patterns: newPatterns });
      console.log("[SamAI Highlighter] Patterns saved to sync store:", newPatterns.length);
      
      // Send message to content scripts for immediate updates
      window.postMessage({ type: "SAMAI_SEARCH_SETTINGS_UPDATED" }, "*");
    } catch (error) {
      console.error("[SamAI Highlighter] Error saving patterns to sync store:", error);
    }
    
    // Trigger re-processing
    this.processResults();
  }

  private applyPatternHighlighting(element: Element, domain: string) {
    // Remove existing highlight styles first
    element.removeAttribute('data-samai-highlight-style');
    const htmlElement = element as HTMLElement;
    htmlElement.style.borderLeft = "";
    htmlElement.style.paddingLeft = "";
    
    // Check if domain matches any enabled patterns
    const matchingPattern = this.patterns.find(p => 
      p.enabled && domain.toLowerCase().includes(p.pattern.toLowerCase())
    );
    
    if (matchingPattern && matchingPattern.color !== "#000000") {
      // Apply highlight
      element.setAttribute('data-samai-highlight-style', 'true');
      htmlElement.style.borderLeft = `3px solid ${matchingPattern.color}`;
      htmlElement.style.paddingLeft = "8px";
      
      console.log("[SamAI Highlighter] Applied highlight for domain:", domain, "with color:", matchingPattern.color);
    } else if (matchingPattern && matchingPattern.color === "#000000") {
      // Hidden domain
      htmlElement.style.display = "none";
    }
  }

  public clearHighlights() {
    // Remove action buttons and highlighting from all processed results
    const processedResults = document.querySelectorAll('.samai-processed-result');
    processedResults.forEach(result => {
      const htmlElement = result as HTMLElement;
      htmlElement.removeAttribute('data-samai-highlight-style');
      htmlElement.style.borderLeft = "";
      htmlElement.style.paddingLeft = "";
      htmlElement.style.display = "";
      
      const actions = result.querySelector('.samai-search-result-actions');
      if (actions) {
        actions.remove();
      }
      
      result.classList.remove('samai-processed-result');
    });
  }

  private isSearchResultsPage(): boolean {
    const url = window.location.href.toLowerCase();
    return url.includes('google.com/search') ||
           url.includes('bing.com/search') ||
           url.includes('duckduckgo.com/') ||
           url.includes('yahoo.com/search') ||
           url.includes('search.yahoo.com') ||
           url.includes('ask.com/web') ||
           url.includes('?q=') ||
           url.includes('?query=');
  }

  private getSearchResultElements(): Element[] {
    const selectors = [
      // Google
      'div[data-ved] .g',
      'div[data-ved] .rc',
      'div[data-ved] .r',
      '.tF2Cxc',
      '.MjjYud',
      // Bing
      'li.b_algo',
      'div.b_algo',
      // DuckDuckGo
      'div.result',
      'div.results .result',
      // Yahoo
      'div.dd',
      'div.wc',
      // General
      '.search-result',
      '.result-item',
      '.search-result-item'
    ];

    const elements: Element[] = [];
    for (const selector of selectors) {
      const found = document.querySelectorAll(selector);
      elements.push(...found);
    }

    // Fallback: try to find common search result patterns
    if (elements.length === 0) {
      const candidates = document.querySelectorAll('a[href]');
      candidates.forEach(candidate => {
        const parent = candidate.closest('div, li, article');
        if (parent && parent.textContent && parent.textContent.length > 100) {
          elements.push(parent);
        }
      });
    }

    console.log("[SamAI Highlighter] Search result elements found:", elements.length);

    return elements;
  }

  public getHighlightStats() {
    const highlights = document.querySelectorAll('[data-samai-highlight-style="true"]');
    return {
      highlighted: highlights.length,
      total: this.getSearchResultElements().length,
      enabledPatterns: this.patterns.filter(p => p.enabled).length,
    };
  }

  // Public method to manually trigger highlighting
  public refreshHighlights() {
    this.loadSettings().then(() => {
      this.processResults();
    });
  }
}

// Initialize the highlighter when the content script loads
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new SearchHighlighter();
    });
  } else {
    new SearchHighlighter();
  }
}

// Export for module usage
export { SearchHighlighter };

// Export types for use in other modules
  export type { HighlightPattern, HighlightSettings };

