import { analyzePageForms } from "./formAnalysis";
import { generateFormFieldValues } from "./ai/formFillService";
import { markdownToJSON } from "./markdownToJSON";
import { FormFiller, FormFillResult } from "./formFiller";
import { FormProfilesManager } from "./formProfiles";

export interface AutoFormFillOptions {
  useProfileData?: boolean;
  profileFieldValues?: Record<string, string>;
  fallbackToAI?: boolean;
}

export interface AutoFormFillResult {
  success: boolean;
  error?: string;
  filledFields: string[];
  fieldCount: number;
  formCount: number;
  dataSource: 'profile' | 'ai' | 'hybrid';
}

/**
 * Main orchestrator for automatic form filling
 */
export class AutoFormFiller {
  /**
   * Analyzes the current page and fills forms based on user instructions
   */
  public static async fillForms(userInstructions: string, options: AutoFormFillOptions = {}): Promise<AutoFormFillResult> {
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
          formCount: 0,
          dataSource: 'ai'
        };
      }
      
      console.log(`[SamAI] Found ${formAnalysis.fieldCount} form fields in ${formAnalysis.formCount} form(s)`);
      
      if (formAnalysis.fieldCount === 0) {
        return {
          success: false,
          error: "No form fields detected on this page.",
          filledFields: [],
          fieldCount: 0,
          formCount: formAnalysis.formCount,
          dataSource: 'ai'
        };
      }
      
      let fieldData: Record<string, any> | null = null;
      let dataSource: 'profile' | 'ai' | 'hybrid' = 'ai';
      
      // Step 2: Try to use profile data first if requested
      if (options.useProfileData) {
        try {
          let profileFieldValues = options.profileFieldValues;
          
          // If no profile field values provided, get from active profile
          if (!profileFieldValues) {
            profileFieldValues = await FormProfilesManager.getProfileFieldValues();
          }
          
          if (profileFieldValues && Object.keys(profileFieldValues).length > 0) {
            console.log("[SamAI] Using profile data for form filling");
            fieldData = this.mapProfileDataToFormFields(formAnalysis.fields, profileFieldValues);
            dataSource = 'profile';
          } else if (options.fallbackToAI !== false) {
            console.log("[SamAI] No profile data available, falling back to AI");
          } else {
            return {
              success: false,
              error: "No profile data available for form filling.",
              filledFields: [],
              fieldCount: formAnalysis.fieldCount,
              formCount: formAnalysis.formCount,
              dataSource: 'profile'
            };
          }
        } catch (profileError) {
          console.warn("[SamAI] Error using profile data, falling back to AI:", profileError);
          if (options.fallbackToAI === false) {
            return {
              success: false,
              error: "Failed to use profile data for form filling.",
              filledFields: [],
              fieldCount: formAnalysis.fieldCount,
              formCount: formAnalysis.formCount,
              dataSource: 'profile'
            };
          }
        }
      }
      
      // Step 3: Use AI if profile data not available or as fallback
      if (!fieldData) {
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
            formCount: formAnalysis.formCount,
            dataSource: 'ai'
          };
        }
        
        // Step 4: Convert AI response from markdown to JSON
        fieldData = markdownToJSON(aiResponse);
        dataSource = 'ai';
        
        if (!fieldData) {
          return {
            success: false,
            error: "Failed to parse AI response. Please try again with clearer instructions.",
            filledFields: [],
            fieldCount: formAnalysis.fieldCount,
            formCount: formAnalysis.formCount,
            dataSource: 'ai'
          };
        }
      }
      
      console.log("[SamAI] Parsed field data:", fieldData);
      
      // Step 5: Fill the form with parsed values
      const fillResult: FormFillResult = FormFiller.fillForm({
        aiResponse: fieldData
      });
      
      if (fillResult.success) {
        console.log(`[SamAI] Successfully filled ${fillResult.filledFields.length} form fields`);
        return {
          success: true,
          filledFields: fillResult.filledFields,
          fieldCount: formAnalysis.fieldCount,
          formCount: formAnalysis.formCount,
          dataSource
        };
      } else {
        return {
          success: false,
          error: fillResult.error || "Failed to fill form fields",
          filledFields: fillResult.filledFields,
          fieldCount: formAnalysis.fieldCount,
          formCount: formAnalysis.formCount,
          dataSource
        };
      }
      
    } catch (error) {
      console.error("[SamAI] Error in automatic form filling:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred during form filling",
        filledFields: [],
        fieldCount: 0,
        formCount: 0,
        dataSource: 'ai'
      };
    }
  }
  
  /**
   * Map profile field values to form field names based on common patterns
   */
  private static mapProfileDataToFormFields(formFields: any[], profileData: Record<string, string>): Record<string, any> {
    const mappedData: Record<string, any> = {};
    
    // Create a mapping of form field names to profile data
    for (const field of formFields) {
      const fieldName = field.name?.toLowerCase() || '';
      const fieldId = field.id?.toLowerCase() || '';
      const fieldLabel = field.label?.toLowerCase() || '';
      const fieldPlaceholder = field.placeholder?.toLowerCase() || '';
      
      // Check each profile data field for matches
      for (const [profileKey, profileValue] of Object.entries(profileData)) {
        if (!profileValue || !profileValue.trim()) continue;
        
        const profileKeyLower = profileKey.toLowerCase();
        
        // Direct name matching
        if (fieldName.includes(profileKeyLower) || profileKeyLower.includes(fieldName)) {
          mappedData[field.name || field.id || field.label || ''] = profileValue;
          continue;
        }
        
        // ID matching
        if (fieldId.includes(profileKeyLower) || profileKeyLower.includes(fieldId)) {
          mappedData[field.name || field.id || field.label || ''] = profileValue;
          continue;
        }
        
        // Label matching
        if (fieldLabel.includes(profileKeyLower) || profileKeyLower.includes(fieldLabel)) {
          mappedData[field.name || field.id || field.label || ''] = profileValue;
          continue;
        }
        
        // Placeholder matching
        if (fieldPlaceholder.includes(profileKeyLower) || profileKeyLower.includes(fieldPlaceholder)) {
          mappedData[field.name || field.id || field.label || ''] = profileValue;
          continue;
        }
        
        // Common field patterns
        if (this.isFieldMatch(fieldName, fieldId, fieldLabel, fieldPlaceholder, profileKeyLower)) {
          mappedData[field.name || field.id || field.label || ''] = profileValue;
        }
      }
    }
    
    return mappedData;
  }
  
  /**
   * Check if a form field matches a profile key based on common patterns
   */
  private static isFieldMatch(fieldName: string, fieldId: string, fieldLabel: string, fieldPlaceholder: string, profileKey: string): boolean {
    const patterns: Array<[string, string[]]> = [
      // Name patterns
      ['first', ['first', 'fname', 'given']],
      ['last', ['last', 'lname', 'surname', 'family']],
      ['name', ['name', 'fullname', 'full_name']],
      
      // Email patterns
      ['email', ['email', 'mail']],
      
      // Phone patterns
      ['phone', ['phone', 'tel', 'telephone', 'mobile', 'cell']],
      
      // Address patterns
      ['address', ['address', 'addr', 'street']],
      ['city', ['city', 'town']],
      ['state', ['state', 'province', 'region']],
      ['zip', ['zip', 'postal', 'postcode']],
      ['country', ['country', 'nation']],
      
      // Professional patterns
      ['company', ['company', 'organization', 'organisation', 'org']],
      ['job', ['job', 'title', 'position', 'role']],
      
      // Social patterns
      ['linkedin', ['linkedin']],
      ['github', ['github']],
      ['twitter', ['twitter', 'x']],
      ['website', ['website', 'url', 'site']]
    ];
    
    for (const [key, variations] of patterns) {
      if (profileKey === key || variations.includes(profileKey)) {
        const allFieldText = `${fieldName} ${fieldId} ${fieldLabel} ${fieldPlaceholder}`;
        return variations.some(variation => allFieldText.includes(variation));
      }
    }
    
    return false;
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