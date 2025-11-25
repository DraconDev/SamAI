import { FormFieldData } from "./formFiller";

/**
 * Converts AI markdown response to JSON object
 * Extracts JSON from markdown code blocks
 */
export function markdownToJSON(markdown: string): FormFieldData | null {
  try {
    // Try to find JSON in code blocks
    const jsonMatch = markdown.match(/```(?:json)?\n([\s\S]*?)\n```/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1].trim();
      const parsed = JSON.parse(jsonStr);
      return parsed;
    }

    // Fallback: try to parse the entire response as JSON
    // (some AI responses might not be in code blocks)
    const trimmedMarkdown = markdown.trim();
    if (trimmedMarkdown.startsWith('{') && trimmedMarkdown.endsWith('}')) {
      try {
        return JSON.parse(trimmedMarkdown);
      } catch (e) {
        // Not valid JSON, continue to other methods
      }
    }

    // Fallback: try to extract key-value pairs from text
    // This is a basic implementation - could be enhanced
    const lines = markdown.split('\n');
    const result: FormFieldData = {};
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        // Look for "key: value" or "key = value" patterns
        const match = trimmedLine.match(/^["']?([^:"'=]+)["']?\s*[:=]\s*["']?([^"'\n]+)["']?/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (key && value) {
            result[key] = value;
          }
        }
      }
    }

    // Return result only if we found some data
    return Object.keys(result).length > 0 ? result : null;
    
  } catch (error) {
    console.error("[SamAI] Error parsing markdown to JSON:", error);
    return null;
  }
}