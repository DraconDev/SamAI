import { extractPageContent } from "@/utils/page-content";
import type { OutputFormat } from "@/utils/page-content";
import { showSidePanel } from "@/src/content/search";

// Message type interfaces
interface GetPageContentMessage {
  type: "getPageContent";
  outputFormat: OutputFormat;
}

interface GetInputInfoMessage {
  type: "getInputInfo";
}

interface SetInputValueMessage {
  type: "setInputValue";
  value: string;
}

interface ShowSummaryMessage {
  type: "showSummary";
  summary: string;
}

interface PageContentResponseMessage {
  type: "pageContentResponse";
  content: string;
  outputFormat: OutputFormat;
  error?: string;
}

export interface InputElementClickedMessage {
  type: "inputElementClicked";
  inputInfo: {
    value: string;
    placeholder: string;
    id: string;
    name: string;
    inputType: string;
  };
}

export type ContentScriptMessage =
  | GetPageContentMessage
  | GetInputInfoMessage
  | SetInputValueMessage
  | ShowSummaryMessage
  | PageContentResponseMessage
  | InputElementClickedMessage;

// Type guard for incoming messages
export function isContentScriptMessage(message: any): message is ContentScriptMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    "type" in message &&
    typeof message.type === "string"
  );
}

// Individual message handlers
export const handleGetPageContent = async (message: GetPageContentMessage): Promise<void> => {
  try {
    const pageContent = extractPageContent(message.outputFormat);
    browser.runtime.sendMessage({
      type: "pageContentResponse",
      content: pageContent,
      outputFormat: message.outputFormat,
    });
  } catch (error) {
    console.error("[SamAI Content] Error extracting page content:", error);
    browser.runtime.sendMessage({
      type: "pageContentResponse",
      content: "",
      outputFormat: message.outputFormat,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const handleGetInputInfo = async (
  lastInputElement: HTMLInputElement | HTMLTextAreaElement | null,
  sendResponse: (response?: any) => void
): Promise<true> => {
  if (lastInputElement) {
    const response = {
      messageType: "inputInfo",
      value: lastInputElement.value,
      placeholder: lastInputElement.placeholder,
      id: lastInputElement.id,
      name: lastInputElement.name,
      inputType:
        lastInputElement instanceof HTMLInputElement
          ? lastInputElement.type
          : "textarea",
    };
    sendResponse(response);
  } else {
    sendResponse(false);
  }
  return true;
};

export const handleSetInputValue = async (
  message: SetInputValueMessage,
  lastInputElement: HTMLInputElement | HTMLTextAreaElement | null,
  sendResponse: (response?: any) => void
): Promise<true> => {
  if (lastInputElement && typeof message.value === "string") {
    try {
      lastInputElement.value = message.value;
      lastInputElement.dispatchEvent(new Event("input", { bubbles: true }));
      lastInputElement.dispatchEvent(new Event("change", { bubbles: true }));
      sendResponse({ success: true });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      sendResponse({ success: false, error: errorMessage });
    }
  } else {
    sendResponse({
      success: false,
      error: "Invalid message or no input element",
    });
  }
  return true;
};

export const handleShowSummary = async (
  message: ShowSummaryMessage,
  sendResponse: (response?: any) => void
): Promise<true> => {
  if (typeof message.summary === "string") {
    showSidePanel(message.summary);
    sendResponse(true);
  } else {
    sendResponse(false);
  }
  return true;
};

// Main message router
export async function routeMessage(
  message: ContentScriptMessage,
  sendResponse: (response?: any) => void,
  lastInputElement: HTMLInputElement | HTMLTextAreaElement | null
): Promise<true | undefined> {
  switch (message.type) {
    case "getPageContent":
      await handleGetPageContent(message);
      return;
    case "getInputInfo":
      return handleGetInputInfo(lastInputElement, sendResponse);
    case "setInputValue":
      return handleSetInputValue(message, lastInputElement, sendResponse);
    case "showSummary":
      return handleShowSummary(message, sendResponse);
    default:
      console.log("[SamAI Content] Unhandled message type:", message.type);
      return undefined;
  }
}