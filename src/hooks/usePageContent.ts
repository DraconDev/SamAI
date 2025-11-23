import { useCallback } from 'react';
import browser from "webextension-polyfill";
import { optimizeHtmlContent } from '@/utils/page-content';
import type { OutputFormat } from '@/utils/page-content';

export const usePageContent = () => {
  const extractPageContent = useCallback(async (format: OutputFormat, fresh: boolean = false): Promise<string> => {
    try {
      // If not fresh, try storage first
      if (!fresh) {
        const result = await browser.storage.local.get([
          'pageBodyText', 
          'pageOptimizedHtml', 
          'pageContext'
        ]);
        
        const cached = (format === "html" ? result.pageOptimizedHtml : result.pageBodyText) as string;
        if (cached) {
          console.log("[usePageContent] Using cached content:", cached.length);
          return cached;
        }
      }

      // Extract fresh content from DOM
      console.log("[usePageContent] Extracting fresh content...");
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

      // Cache the extracted content
      const storageKey = format === "html" ? "pageOptimizedHtml" : "pageBodyText";
      await browser.storage.local.set({ [storageKey]: content });
      
      console.log("[usePageContent] Fresh content extracted:", content.length);
      return content;
    } catch (error) {
      console.error("[usePageContent] Error extracting page content:", error);
      throw new Error("Failed to extract page content");
    }
  }, []);

  return { extractPageContent };
};