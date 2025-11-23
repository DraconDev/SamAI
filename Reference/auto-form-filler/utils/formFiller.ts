import { FormFillResult } from "@/types/types";

export type FormFieldData = {
  [key: string]: string;
};

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
        // Try to find element by ID first, then by name
        const element = document.getElementsByName(name)[0] as HTMLInputElement;

        if (element && element instanceof HTMLInputElement) {
          // Only fill if the field is editable
          if (!element.readOnly && !element.disabled) {
            element.value = value;
            // Trigger input event to notify any listeners
            element.dispatchEvent(new Event("input", { bubbles: true }));
            // Trigger change event for good measure
            element.dispatchEvent(new Event("change", { bubbles: true }));
            filledFields.push(name);
          }
        }
      }

      return {
        success: true,
        filledFields,
      };
    } catch (error) {
      console.error("Error filling form:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fill form",
        filledFields: [],
      };
    }
  }
}
