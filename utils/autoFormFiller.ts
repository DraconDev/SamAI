import { analyzePageForms } from "./formAnalysis";
import { generateFormFieldValues } from "./ai/formFillService";
import { markdownToJSON } from "./markdownToJSON";
import { FormFiller, FormFillResult } from "./formFiller";

export interface AutoFormFillResult {
  success: boolean;
  error?: string;
  filledFields: string[];
  fieldCount: number;
  formCount: number;
}

/**
 * Main orchestrator for automatic form filling
 */
export class AutoFormFiller {
  /**
   * Analyzes the current page and fills forms based on user instructions
   */
  public static async fillForms(userInstructions: string): Promise<AutoFormFillResult> {
    try {
      console.log("[SamAI] Starting automatic form filling...");
      
      // Step 1: Analyze forms on the current page
      const formAnalysis = await analyzePageForms();
      
      if (!formAnalysis.hasForms) {
        return {
          success: false,
          error: "No fillable form fields found on this page.",
          filledFields: [],
          fieldCount: 0,
          formCount: 0
        };
      }
      
      console.log(`[SamAI] Found ${formAnalysis.fieldCount} form fields in ${formAnalysis.formCount} form(s)`);
      
      if (formAnalysis.fieldCount === 0) {
        return {
          success: false,
          error: "No form fields detected on this page.",
          filledFields: [],
          fieldCount: 0,
          formCount: formAnalysis.formCount
        };
      }
      
      // Step 2: Get AI-generated field values
      const aiResponse = await generateFormFieldValues({
        pageHtml: formAnalysis.optimizedHtml,
        userInstructions: userInstructions,
        includeContext: true
      });
      
      if (!aiResponse) {
        return {
          success: false,
          error: "Failed to get AI suggestions for form filling.",
          filledFields: [],
          fieldCount: formAnalysis.fieldCount,
          formCount: formAnalysis.formCount
        };
      }
      
      // Step 3: Convert AI response from markdown to JSON
      const fieldData = markdownToJSON(aiResponse);
      
      if (!fieldData) {
        return {
          success: false,
          error: "Failed to parse AI response. Please try again with clearer instructions.",
          filledFields: [],
          fieldCount: formAnalysis.fieldCount,
          formCount: formAnalysis.formCount
        };
      }
      
      console.log("[SamAI] Parsed field data:", fieldData);
      
      // Step 4: Fill the form with AI-generated values
      const fillResult: FormFillResult = FormFiller.fillForm({
        aiResponse: fieldData
      });
      
      if (fillResult.success) {
        console.log(`[SamAI] Successfully filled ${fillResult.filledFields.length} form fields`);
        return {
          success: true,
          filledFields: fillResult.filledFields,
          fieldCount: formAnalysis.fieldCount,
          formCount: formAnalysis.formCount
        };
      } else {
        return {
          success: false,
          error: fillResult.error || "Failed to fill form fields",
          filledFields: fillResult.filledFields,
          fieldCount: formAnalysis.fieldCount,
          formCount: formAnalysis.formCount
        };
      }
      
    } catch (error) {
      console.error("[SamAI] Error in automatic form filling:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred during form filling",
        filledFields: [],
        fieldCount: 0,
        formCount: 0
      };
    }
  }
  
  /**
   * Analyzes forms without filling them (for preview)
   */
  public static async analyzeForms(): Promise<{
    hasForms: boolean;
    fieldCount: number;
    formCount: number;
    fields: Array<{name?: string; id?: string; type: string; label?: string; placeholder?: string}>;
  }> {
    try {
      const analysis = await analyzePageForms();
      return {
        hasForms: analysis.hasForms,
        fieldCount: analysis.fieldCount,
        formCount: analysis.formCount,
        fields: analysis.fields
      };
    } catch (error) {
      console.error("[SamAI] Error analyzing forms:", error);
      return {
        hasForms: false,
        fieldCount: 0,
        formCount: 0,
        fields: []
      };
    }
  }
}