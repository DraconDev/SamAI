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
      this.settings.autoHighlight = true; // Always auto-highlight when patterns exist
      this.settings.highlightOpacity = 0.3; // Default opacity
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
            this.applyHighlights();
          });
          return true;
        }

        if (typedMessage.type === "TOGGLE_AUTO_HIGHLIGHT" && typedMessage.enabled !== undefined) {
          this.settings.autoHighlight = typedMessage.enabled;
          if (typedMessage.enabled) {
            this.applyHighlights();
          } else {
            this.clearHighlights();
          }
          return true;
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
      
      // Return undefined for unhandled messages
    });
  }

  public applyHighlights() {
    console.log("[SamAI Highlighter] Starting applyHighlights", {
      autoHighlight: this.settings.autoHighlight,
      patternsCount: this.patterns.length,
      patterns: this.patterns,
      currentURL: window.location.href,
      isSearchPage: this.isSearchResultsPage()
    });

    if (!this.settings.autoHighlight || this.patterns.length === 0) {
      console.log("[SamAI Highlighter] Skipping highlights - autoHighlight:", this.settings.autoHighlight, "patterns:", this.patterns.length);
      return;
    }

    // Only highlight on search results pages
    if (!this.isSearchResultsPage()) {
      console.log("[SamAI Highlighter] Not a search results page, skipping");
      return;
    }

    // Clear existing highlights first
    this.clearHighlights();

    // Find and highlight matching elements
    const searchResults = this.getSearchResultElements();
    console.log("[SamAI Highlighter] Found search results:", searchResults.length);
    
    let highlightCount = 0;
    for (const element of searchResults) {
      const elementText = element.textContent?.toLowerCase() || "";
      const elementUrl = this.getElementUrl(element);
      
      for (const pattern of this.patterns) {
        if (!pattern.enabled) continue;
        
        const patternLower = pattern.pattern.toLowerCase().trim();
        if (!patternLower) continue;
        
        // Check if pattern matches URL or text content
        const matchesUrl = elementUrl && elementUrl.toLowerCase().includes(patternLower);
        const matchesText = elementText.includes(patternLower);
        
        console.log("[SamAI Highlighter] Checking pattern:", pattern.pattern, "against URL:", elementUrl, "Text match:", matchesText, "URL match:", matchesUrl);
        
        if (matchesUrl || matchesText) {
          console.log("[SamAI Highlighter] Highlighting element with pattern:", pattern.pattern, "color:", pattern.color);
          this.highlightElement(element, pattern.color, pattern.description);
          highlightCount++;
          break; // Only highlight once per element
        }
      }
    }
    
    console.log("[SamAI Highlighter] Finished highlighting, total highlights:", highlightCount);
  }

  public clearHighlights() {
    // Remove all highlight elements
    const highlights = document.querySelectorAll('[data-samai-highlight="true"]');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        // Move child nodes back to parent
        while (highlight.firstChild) {
          parent.insertBefore(highlight.firstChild, highlight);
        }
        // Remove the highlight wrapper
        parent.removeChild(highlight);
      }
    });

    // Remove background styles
    const styledElements = document.querySelectorAll('[data-samai-highlight-style="true"]');
    styledElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      element.removeAttribute('data-samai-highlight-style');
      htmlElement.style.backgroundColor = '';
      htmlElement.style.background = '';
      htmlElement.style.borderLeft = '';
      htmlElement.style.borderRadius = '';
      htmlElement.style.transition = '';
      htmlElement.style.padding = '';
      htmlElement.style.margin = '';
      
      // Remove existing event listeners by cloning
      const clone = htmlElement.cloneNode(true);
      htmlElement.parentNode?.replaceChild(clone, htmlElement);
    });
  }

  private isSearchResultsPage(): boolean {
    const url = window.location.href.toLowerCase();
    return url.includes('google.com/search') ||
           url.includes('bing.com/search') ||
           url.includes('duckduckgo.com/') ||
           url.includes('yahoo.com/search') ||
           url.includes('search.yahoo.com') ||
           url.includes('ask.com/web');
  }

  private getSearchResultElements(): Element[] {
    const selectors = [
      // Google
      'div[data-ved] .g',
      'div[data-ved] .rc',
      'div[data-ved] .r',
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

    return elements;
  }

  private getElementUrl(element: Element): string | null {
    // Try to find a URL in the element
    const link = element.querySelector('a[href]');
    if (link && link.getAttribute('href')) {
      return link.getAttribute('href');
    }

    // Try to extract URL from text content
    const text = element.textContent || '';
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    return urlMatch ? urlMatch[0] : null;
  }

  private highlightElement(element: Element, color: string, description: string) {
    // Cast to HTMLElement to access style property
    const htmlElement = element as HTMLElement;
    
    // Method 1: Add background color directly to the element
    element.setAttribute('data-samai-highlight-style', 'true');
    
    // Convert opacity to hex for background color
    const opacity = this.settings.highlightOpacity;
    const hexOpacity = Math.round(opacity * 255);
    const hexColor = hexOpacity.toString(16).padStart(2, '0');
    
    htmlElement.style.backgroundColor = color + hexColor;
    htmlElement.style.borderLeft = `4px solid ${color}`;
    htmlElement.style.borderRadius = '4px';
    htmlElement.style.transition = 'all 0.3s ease';
    htmlElement.style.padding = '8px';
    htmlElement.style.margin = '4px 0';

    // Add hover effect with proper event listener management
    const handleMouseEnter = () => {
      const hoverOpacity = Math.min(opacity + 0.1, 1);
      const hoverHexOpacity = Math.round(hoverOpacity * 255);
      const hoverHexColor = hoverHexOpacity.toString(16).padStart(2, '0');
      htmlElement.style.backgroundColor = color + hoverHexColor;
    };

    const handleMouseLeave = () => {
      htmlElement.style.backgroundColor = color + hexColor;
    };

    // Store event listeners for cleanup
    htmlElement.addEventListener('mouseenter', handleMouseEnter);
    htmlElement.addEventListener('mouseleave', handleMouseLeave);

    // Method 2: Wrap matching text in a span (optional enhancement)
    this.wrapMatchingText(element, color, description);
  }

  private wrapMatchingText(element: Element, color: string, description: string) {
    // This is a more advanced feature - wrapping specific text matches
    // For now, we'll keep it simple and just add the background styling
    // Could be enhanced later to wrap specific text patterns
    
    // Add a subtle tooltip-like indication
    if (description) {
      element.setAttribute('title', `Highlighted: ${description}`);
    }
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
      this.applyHighlights();
    });
  }

  // Method to add custom pattern programmatically
  public addPattern(pattern: Omit<HighlightPattern, 'id'>) {
    const newPattern: HighlightPattern = {
      ...pattern,
      id: Date.now().toString(),
    };
    
    this.patterns.push(newPattern);
    localStorage.setItem("samai-highlight-patterns", JSON.stringify(this.patterns));
    this.applyHighlights();
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