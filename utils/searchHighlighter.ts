import { searchSettingsStore, type SearchSettingsStore } from "./store";

interface HighlightPattern {
  id: string;
  pattern: string;
  color: string;
  description: string;
  enabled: boolean;
}

interface HighlightSettings {
  autoHighlight: boolean;
  highlightOpacity: number;
}

interface Message {
  type: string;
  enabled?: boolean;
}

class SearchHighlighter {
  private settings: HighlightSettings = {
    autoHighlight: true,
    highlightOpacity: 0.3,
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
      // Load patterns from localStorage
      const savedPatterns = localStorage.getItem("samai-highlight-patterns");
      if (savedPatterns) {
        this.patterns = JSON.parse(savedPatterns);
      }

      // Load highlight settings from searchSettingsStore
      const searchSettings = await searchSettingsStore.getValue();
      this.settings.autoHighlight = true;
      this.settings.highlightOpacity = 0.3;
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
      } catch (error) {
        console.error("Error handling message:", error);
      }
      
      return undefined;
    });
  }

  public processResults() {
    console.log("[SamAI Highlighter] Starting processResults", {
      autoHighlight: this.settings.autoHighlight,
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

      // Add highlight button
      const highlightBtn = document.createElement("button");
      highlightBtn.innerHTML = "☆";
      highlightBtn.title = "Highlight this domain";
      highlightBtn.style.cursor = "pointer";
      highlightBtn.style.background = "none";
      highlightBtn.style.border = "none";
      highlightBtn.style.padding = "0";
      highlightBtn.style.fontSize = "18px";
      highlightBtn.style.color = "#666";
      highlightBtn.style.transition = "all 0.2s";
      
      highlightBtn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const currentPatterns = this.patterns.slice();
        const existingPattern = currentPatterns.find(p => 
          p.enabled && domain.includes(p.pattern.toLowerCase())
        );
        
        if (existingPattern) {
          // Remove highlight
          const updatedPatterns = currentPatterns.map(p => 
            p.id === existingPattern.id ? { ...p, enabled: false } : p
          );
          this.updatePatterns(updatedPatterns);
          highlightBtn.style.color = "#666";
          highlightBtn.innerHTML = "☆";
          console.log("[SamAI Highlighter] Removed highlight for domain:", domain);
        } else {
          // Add highlight with default color
          const newPattern: HighlightPattern = {
            id: Date.now().toString(),
            pattern: domain,
            color: "#4f46e5",
            description: domain,
            enabled: true,
          };
          updatedPatterns.push(newPattern);
          this.updatePatterns(updatedPatterns);
          highlightBtn.style.color = "#4f46e5";
          highlightBtn.innerHTML = "★";
          console.log("[SamAI Highlighter] Added highlight for domain:", domain);
        }
        
        this.applyPatternHighlighting(resultElement, domain);
      };
      
      actions.appendChild(highlightBtn);

      // Add hide button
      const hideBtn = document.createElement("button");
      hideBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      `;
      hideBtn.title = "Hide this domain";
      hideBtn.style.cursor = "pointer";
      hideBtn.style.background = "none";
      hideBtn.style.border = "none";
      hideBtn.style.padding = "0";
      hideBtn.style.fontSize = "18px";
      hideBtn.style.color = "#666";
      
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
      (actions as HTMLElement).style.right = "-26px";
      (actions as HTMLElement).style.top = "0";
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
    localStorage.setItem("samai-highlight-patterns", JSON.stringify(newPatterns));
    
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
