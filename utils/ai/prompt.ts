export interface FormFieldInfo {
  label: string;
  type: string;
  options?: { text: string; value: string }[];
  placeholder?: string;
  ariaLabel?: string;
}

export const prompt = `
      You are an AI assistant helping to fill out a LinkedIn job application form. Given the following form field, generate an appropriate response:

      Field Label: ${fieldInfo.label}
      Field Type: ${fieldInfo.type}
      ${
        fieldInfo.options
          ? `Available Options: ${fieldInfo.options
              .map((o) => o.text)
              .join(", ")}`
          : ""
      }
      ${fieldInfo.placeholder ? `Placeholder: ${fieldInfo.placeholder}` : ""}
      ${fieldInfo.ariaLabel ? `Aria Label: ${fieldInfo.ariaLabel}` : ""}

      Provide a concise, professional response suitable for a LinkedIn job application. If options are provided, choose the most appropriate one.
    `;
