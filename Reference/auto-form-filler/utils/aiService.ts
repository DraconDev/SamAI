import { GoogleGenerativeAI } from "@google/generative-ai";
import { env as envStore } from "@/utils/store";

export async function generateFormFields({
  page,
  prompt,
}: {
  page: string;
  prompt?: string;
}): Promise<string | null> {
  log("info", "Starting form fields generation");

  const { env } = await envStore.getValue();

  if (!env) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }

  const genAI = new GoogleGenerativeAI(env);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
    log("debug", "Initialized Gemini model");

    log("debug", "Generated prompt", { prompt });

    const enabled = await descriptionEnabled.getValue();

    let description = "";
    if (enabled) {
      const fields = await commonFormFields.getValue();
      if (!fields) {
        throw new Error("No fields found");
      }
      description = JSON.stringify(fields);
      // console.log("description", description);
    }

    const input = `${page} /n instructions: Give an answer to all input fields as json the ${
      description ? "Info about the user:" + description + "\n" : ""
    } ${prompt ? "Additional instructions: " + prompt + "\n" : ""}`;

    const result = await model.generateContent(input);

    if (!result || !result.response) {
      log("error", "Empty response from Gemini");
      throw new Error("Empty response from Gemini API");
    }

    if (
      !result.response.candidates ||
      !result.response.candidates[0] ||
      !result.response.candidates[0].content ||
      !result.response.candidates[0].content.parts ||
      !result.response.candidates[0].content.parts[0]
    ) {
      log("error", "No candidates in response from Gemini");
      throw new Error("No candidates in response from Gemini API");
    }

    const response = result?.response?.candidates[0].content.parts[0].text;

    if (!response) {
      return null;
    }

    return response;
  } catch (error) {
    log("error", "Error generating form fields", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}
