/**
 * Utility for analyzing and extracting form data from the current page
 */

export interface FormFieldInfo {
  name?: string;
  id?: string;
  type: string;
  label?: string;
  placeholder?: string;
  value?: string;
  checked?: boolean;
  selected?: boolean;
}

export interface PageFormAnalysis {
  hasForms: boolean;
  formCount: number;
  fieldCount: number;
  optimizedHtml: string;
  fields: FormFieldInfo[];
}

/**
 * Analyzes forms on the current page and extracts optimized HTML for AI processing
 */
export async function analyzePageForms(): Promise<PageFormAnalysis> {
  try {
    // Find all form-related elements
    const formElements = document.querySelectorAll('input, select, textarea, button');
    const forms = document.querySelectorAll('form');
    
    if (formElements.length === 0) {
      return {
        hasForms: false,
        formCount: 0,
        fieldCount: 0,
        optimizedHtml: '',
        fields: []
      };
    }

    const fields: FormFieldInfo[] = [];
    let optimizedHtml = '';

    // Process each form element
    Array.from(formElements as NodeListOf<HTMLElement>).forEach((element: HTMLElement) => {
      const fieldInfo = extractFieldInfo(element);
      if (fieldInfo) {
        fields.push(fieldInfo);
        optimizedHtml += formatElementForAI(fieldInfo) + '\n';
      }
    });

    return {
      hasForms: true,
      formCount: forms.length,
      fieldCount: fields.length,
      optimizedHtml: optimizedHtml.trim(),
      fields
    };
  } catch (error) {
    console.error("[SamAI] Error analyzing page forms:", error);
    return {
      hasForms: false,
      formCount: 0,
      fieldCount: 0,
      optimizedHtml: '',
      fields: []
    };
  }
}

/**
 * Extracts field information from a DOM element
 */
function extractFieldInfo(element: HTMLElement): FormFieldInfo | null {
  if (!(element instanceof HTMLInputElement) && 
      !(element instanceof HTMLSelectElement) && 
      !(element instanceof HTMLTextAreaElement) &&
      !(element instanceof HTMLButtonElement)) {
    return null;
  }

  // Skip hidden elements and buttons (unless they're submit buttons)
  if (element.type === 'hidden' || 
      (element instanceof HTMLButtonElement && element.type !== 'submit')) {
    return null;
  }

  const info: FormFieldInfo = {
    type: element.type || element.tagName.toLowerCase()
  };

  // Get name attribute (most important for filling)
  if (element.name) {
    info.name = element.name;
  }

  // Get id attribute (fallback for filling)
  if (element.id) {
    info.id = element.id;
  }

  // Get placeholder (only for elements that have it)
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    if (element.placeholder) {
      info.placeholder = element.placeholder;
    }
  }

  // Get current value
  if (element instanceof HTMLInputElement) {
    if (element.type === 'checkbox' || element.type === 'radio') {
      info.checked = element.checked;
    } else if (element.value) {
      info.value = element.value;
    }
  } else if (element instanceof HTMLSelectElement) {
    if (element.value) {
      info.value = element.value;
    }
    info.selected = element.selectedIndex >= 0;
  } else if (element instanceof HTMLTextAreaElement) {
    if (element.value) {
      info.value = element.value;
    }
  }

  // Try to find associated label
  const label = findAssociatedLabel(element);
  if (label) {
    info.label = label;
  }

  return info;
}

/**
 * Finds the label associated with a form element
 */
function findAssociatedLabel(element: HTMLElement): string | undefined {
  const elementId = element.id;
  const elementName = element.getAttribute('name');

  // Method 1: Find label with for attribute
  if (elementId) {
    const labelElement = document.querySelector(`label[for="${elementId}"]`) as HTMLLabelElement | null;
    if (labelElement) {
      return labelElement.innerText.trim();
    }
  }

  // Method 2: Find label wrapping the element
  const parentLabel = element.closest('label');
  if (parentLabel) {
    return parentLabel.innerText.trim();
  }

  // Method 3: Find nearby text that might be a label
  const previousSibling = element.previousElementSibling;
  if (previousSibling && 
      (previousSibling.tagName === 'LABEL' || 
       previousSibling.tagName === 'SPAN' ||
       previousSibling.tagName === 'DIV')) {
    const text = (previousSibling as HTMLElement).innerText.trim();
    if (text && text.length < 100) { // Reasonable label length
      return text;
    }
  }

  return undefined;
}

/**
 * Formats a field for AI consumption
 */
function formatElementForAI(field: FormFieldInfo): string {
  let elementStr = `<${field.type}`;
  
  // Add name attribute (most important)
  if (field.name) {
    elementStr += ` name="${field.name}"`;
  }
  
  // Add id if no name
  if (!field.name && field.id) {
    elementStr += ` id="${field.id}"`;
  }
  
  // Add type for inputs
  if (field.type !== 'select' && field.type !== 'textarea') {
    elementStr += ` type="${field.type}"`;
  }
  
  // Add placeholder
  if (field.placeholder) {
    elementStr += ` placeholder="${field.placeholder}"`;
  }
  
  // Add current value (if meaningful)
  if (field.value && field.value.trim()) {
    elementStr += ` value="${field.value.trim()}"`;
  }
  
  // Add checked/selected states
  if (field.checked) {
    elementStr += ` checked="true"`;
  }
  if (field.selected) {
    elementStr += ` selected="true"`;
  }
  
  elementStr += '>';
  
  // Add label if available
  if (field.label) {
    elementStr = `<label>${field.label}</label>\n${elementStr}`;
  }
  
  return elementStr;
}