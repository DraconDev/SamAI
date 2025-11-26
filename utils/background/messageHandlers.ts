import { generateFormResponse } from "@/utils/ai/gemini";
import type { OutputFormat } from "@/utils/page-content";
import type { Runtime } from "wxt/browser";

// Message type interfaces
interface BaseMessage {
  type: string;
}

interface GenerateGeminiResponseRequest extends BaseMessage {
  type: "generateGeminiResponse";
  prompt: string;
}

interface OpenApiKeyPageRequest extends BaseMessage {
  type: "openApiKeyPage";
}

interface OpenSearchSettingsPageRequest extends BaseMessage {
  type: "openSearchSettingsPage";
}

interface SetInputValueRequest extends BaseMessage {
  type: "setInputValue";
  value: string;
}

interface ClearInputElementMessage extends BaseMessage {
  type: "clearInputElement";
}

interface GetPageContentRequest extends BaseMessage {
  type: "getPageContent";
  outputFormat: OutputFormat;
}

interface PageContentResponseMessage extends BaseMessage {
  type: "pageContentResponse";
  content: string;
  outputFormat: OutputFormat;
  error?: string;
}

interface InputElementClickedMessage extends BaseMessage {
  type: "inputElementClicked";
  inputInfo: any; // Would be better typed
}

interface CaptureScreenshotRequest extends BaseMessage {
  type: "captureScreenshot";
}

interface ScreenshotResponseMessage extends BaseMessage {
  type: "screenshotResponse";
  dataUrl: string;
  error?: string;
}

export type BackgroundMessage =
  | GenerateGeminiResponseRequest
  | OpenApiKeyPageRequest
  | OpenSearchSettingsPageRequest
  | SetInputValueRequest
  | GetPageContentRequest
  | PageContentResponseMessage
  | InputElementClickedMessage
  | ClearInputElementMessage
  | CaptureScreenshotRequest
  | ScreenshotResponseMessage;

// Type guard for incoming messages
export function isBackgroundMessage(
  message: any
): message is BackgroundMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    "type" in message &&
    typeof message.type === "string"
  );
}

// Individual message handlers
export const handleGenerateGeminiResponse = async (
  message: GenerateGeminiResponseRequest,
  sender: Runtime.MessageSender
): Promise<string | null> => {
  // Check if sender is a valid tab
  if (!sender.tab) {
    console.error("[SamAI Background] No sender tab found");
    return Promise.resolve(null);
  }

  return (async () => {
    let text: string | null = null;
    try {
      text = await generateFormResponse(message.prompt);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("[SamAI Background] Error in generateFormResponse call:", {
        message: err.message,
        stack: err.stack,
      });
    }

    if (text !== null) {
      return JSON.stringify({ responseText: text });
    } else {
      return null;
    }
  })();
};

export const handleOpenApiKeyPage = async (): Promise<undefined> => {
  browser.tabs.create({ url: "apikey.html" });
  return undefined;
};

export const handleOpenSearchSettingsPage = async (): Promise<undefined> => {
  browser.tabs.create({ url: "search-settings.html" });
  return undefined;
};

export const handleSetInputValue = async (
  message: SetInputValueRequest,
  sourceTabId: number | null,
  sendResponse: (response?: any) => void
): Promise<true> => {
  if (sourceTabId) {
    browser.tabs
      .sendMessage(sourceTabId, message)
      .then((result) => {
        sendResponse(result);
      })
      .catch((error) => {
        console.error("Error forwarding message:", error);
        sendResponse({
          success: false,
          error: "Failed to forward message to content script",
        });
      });
    return true;
  } else {
    sendResponse({ success: false, error: "Source tab not available" });
    return true;
  }
};

export const handlePageContentResponse = async (
  message: PageContentResponseMessage
): Promise<undefined> => {
  if (message.outputFormat === "text") {
    await browser.storage.local.set({
      pageBodyText: message.content || "Unable to access page content",
    });
  } else if (message.outputFormat === "html") {
    await browser.storage.local.set({
      pageOptimizedHtml: message.content || "Unable to access page content",
    });
  }
  return undefined;
};

export const handleClearInputElement = async (): Promise<undefined> => {
  await browser.storage.local.remove("inputInfo");
  return undefined;
};

export const handleInputElementClicked = async (
  message: InputElementClickedMessage
): Promise<undefined> => {
  await browser.storage.local.set({
    inputInfo: message.inputInfo,
  });
  return undefined;
};

// Main message router
export async function routeMessage(
  message: BackgroundMessage,
  sender: Runtime.MessageSender,
  sendResponse: (response?: any) => void,
  sourceTabId: number | null
): Promise<string | null | boolean | undefined> {
  switch (message.type) {
    case "generateGeminiResponse":
      return handleGenerateGeminiResponse(message, sender);
    case "openApiKeyPage":
      return handleOpenApiKeyPage();
    case "openSearchSettingsPage":
      return handleOpenSearchSettingsPage();
    case "setInputValue":
      return handleSetInputValue(message, sourceTabId, sendResponse);
    case "pageContentResponse":
      return handlePageContentResponse(message);
    case "clearInputElement":
      return handleClearInputElement();
    case "inputElementClicked":
      return handleInputElementClicked(message);
    default:
      console.warn("[SamAI Background] Unknown message type:", message.type);
      return undefined;
  }
}
