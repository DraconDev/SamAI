/**
 * Form filling utility that handles filling form fields with AI-suggested values
 */

export type FormFieldData = {
  [key: string]: string;
};

export interface FormFillResult {
  success: boolean;
  error?: string;
  filledFields: string[];
}

export class FormFiller {
  /**
   * Fills form fields with AI-suggested values
   */
  public static fillForm({
    aiResponse,
  }: {
    aiResponse: FormFieldData;
  }): FormFillResult {
    try {
      const filledFields: string[] = [];

      for (const [name, value] of Object.entries(aiResponse)) {
        // Try to find element by name first, then by id
        let element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null = null;
        
        // Try by name attribute (most common)
        const nameElement = document.getElementsByName(name)[0] as HTMLInputElement;
        if (nameElement && this.isFillableElement(nameElement)) {
          element = nameElement;
        } else {
          // Try by id as fallback
          const idElement = document.getElementById(name) as HTMLInputElement;
          if (idElement && this.isFillableElement(idElement)) {
            element = idElement;
          }
        }

        if (element) {
          this.fillElement(element, value);
          filledFields.push(name);
          console.log(`[SamAI] Filled field "${name}" with value: "${value}"`);
        } else {
          console.warn(`[SamAI] Could not find fillable field for "${name}"`);
        }
      }

      return {
        success: true,
        filledFields,
      };
    } catch (error) {
      console.error("[SamAI] Error filling form:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fill form",
        filledFields: [],
      };
    }
  }

  /**
   * Checks if an element can be filled
   */
  private static isFillableElement(element: Element): boolean {
    if (!(element instanceof HTMLInputElement) && 
        !(element instanceof HTMLSelectElement) && 
        !(element instanceof HTMLTextAreaElement)) {
      return false;
    }

    // Don't fill hidden or disabled elements
    if (element.disabled) {
      return false;
    }

    // Check readOnly only for elements that have it
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      if (element.readOnly) {
        return false;
      }
    }

    // Don't fill hidden input types
    if (element instanceof HTMLInputElement && element.type === 'hidden') {
      return false;
    }

    return true;
  }

  /**
   * Fills a specific form element based on its type
   */
  private static fillElement(
    element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    value: string
  ): void {
    if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox' || element.type === 'radio') {
        // Handle checkboxes and radio buttons
        const boolValue = value.toLowerCase().trim();
        element.checked = boolValue === 'true' || boolValue === '1' || boolValue === 'yes';
      } else {
        // Regular text input
        element.value = value;
      }
    } else if (element instanceof HTMLSelectElement) {
      // Handle select dropdowns
      const options = Array.from(element.options);
      const matchingOption = options.find(option => 
        option.value.toLowerCase() === value.toLowerCase() ||
        option.text.toLowerCase() === value.toLowerCase()
      );
      
      if (matchingOption) {
        element.value = matchingOption.value;
      } else {
        // Try to find partial matches
        const partialMatch = options.find(option =>
          option.value.toLowerCase().includes(value.toLowerCase()) ||
          option.text.toLowerCase().includes(value.toLowerCase())
        );
        if (partialMatch) {
          element.value = partialMatch.value;
        }
      }
    } else if (element instanceof HTMLTextAreaElement) {
      // Handle textareas
      element.value = value;
    }

    // Trigger input and change events to notify listeners
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }
}