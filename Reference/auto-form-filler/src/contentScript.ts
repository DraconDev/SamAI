import { generateFormFields } from "@/utils/aiService";
import { markdownToJSON } from "@/utils/markdownToJSON";

/**
 * Main content script that handles form analysis and filling
 */

const getPageBodyHtml = async () => {
  const formElements = document.querySelectorAll('input, select, textarea');
  let optimizedHtml = '';

  Array.from(formElements as NodeListOf<HTMLElement>).forEach((element: HTMLElement) => {
    let elementHtml = '<' + element.tagName.toLowerCase();
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      // Include only relevant attributes for form filling
      if (['name', 'id', 'type', 'placeholder', 'value', 'checked', 'selected'].includes(attr.name)) {
        elementHtml += ` ${attr.name}="${attr.value}"`;
      }
    }

    // Attempt to find associated label
    let label = '';
    const elementId = element.id;
    const elementName = element.getAttribute('name');

    if (elementId) {
      const labelElement = document.querySelector(`label[for="${elementId}"]`) as HTMLLabelElement | null;
      if (labelElement) {
        label = labelElement.innerText.trim();
      }
    } else if (elementName) {
        // Basic attempt to find a label using name if no id
        const labelElement = document.querySelector(`label[for="${elementName}"]`) as HTMLLabelElement | null;
        if (labelElement) {
          label = labelElement.innerText.trim();
        }
    }


    elementHtml += '>';

    if (label) {
        optimizedHtml += `<label>${label}</label>\n`;
    }

    optimizedHtml += `${elementHtml}\n`;
  });

  return optimizedHtml;
};

export class AutoFormFiller {
  public static async run(prompt?: string) {
    try {
      const originalPageHtml = document.body.innerHTML;
      console.log("Original page HTML size:", originalPageHtml.length);

      const page = await getPageBodyHtml();
      console.log("Optimized page HTML size:", page.length);
      // console.log("Form analysis:", page);

      if (!page) {
        // console.log("No fillable form fields found on this page");
        return;
      }

      // Step 2: Get AI suggestions
      const aiResponse = await generateFormFields({
        page: page,
        prompt: prompt,
      });
      // console.log("AI Response:", aiResponse);

      if (!aiResponse) {
        console.error("Failed to get AI suggestions");
        return;
      }

      // step 3: convert markdown to json object
      const convertedResponse = markdownToJSON(aiResponse);
      // console.log("AI Response JSON:", convertedResponse);

      if (!convertedResponse) {
        console.error("Failed to convert AI response to JSON");
        return;
      }

      // Step 4: Fill the form
      FormFiller.fillForm({
        aiResponse: convertedResponse,
      });
    } catch (error) {
      console.error("Error in AutoFormFiller:", error);
      throw error;
    }
  }
}
