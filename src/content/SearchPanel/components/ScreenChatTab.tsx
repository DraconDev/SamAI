import { LoadingSpinner } from "@/src/components/ui/LoadingSpinner";
import { generateFormResponse } from "@/utils/ai/gemini";
import { apiKeyStore } from "@/utils/store";
import React, { useState } from "react";

interface ScreenChatTabProps {
  onScreenCapture?: (dataUrl: string) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const ScreenChatTab: React.FC<ScreenChatTabProps> = ({
  onScreenCapture,
}) => {
  const [screenImage, setScreenImage] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if API key is set using the same system as other tabs
  React.useEffect(() => {
    const checkApiKey = async () => {
      try {
        const apiKeyData = await apiKeyStore.getValue();
        const hasAnyApiKey = !!(
          apiKeyData.googleApiKey ||
          apiKeyData.openaiApiKey ||
          apiKeyData.anthropicApiKey ||
          apiKeyData.openrouterApiKey
        );
        setIsApiKeySet(hasAnyApiKey);
      } catch (error) {
        console.error("Error checking API keys:", error);
        setIsApiKeySet(false);
      }
    };
    checkApiKey();
  }, []);

  const captureScreenshot = async () => {
    try {
      setIsProcessing(true);

      // Message background script to capture screenshot
      const response = await new Promise<string>((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "captureScreenshot" }, (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error("No screenshot received"));
          }
        });
      });

      setScreenImage(response);

      // Add confirmation message
      const newMessage: ChatMessage = {
        role: "assistant",
        content:
          "Screenshot captured! You can now ask me questions about what's visible on your screen.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages([newMessage]);

      if (onScreenCapture) {
        onScreenCapture(response);
      }
    } catch (error) {
      console.error("Screenshot capture failed:", error);
      let errorContent = "Failed to capture screenshot.";

      if (error instanceof Error) {
        if (error.message.includes("No sender tab found")) {
          errorContent += " No active tab found. Please try again.";
        } else if (error.message.includes("Browser APIs not available")) {
          errorContent +=
            " Browser extension APIs not available. Please reload the page.";
        } else if (error.message.includes("Screenshot returned null")) {
          errorContent += " Screenshot was empty. Please try again.";
        } else {
          errorContent += ` Error: ${error.message}`;
        }
      }

      errorContent +=
        " Please ensure you have granted the necessary permissions and try again.";

      const errorMessage: ChatMessage = {
        role: "assistant",
        content: errorContent,
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages([errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !isApiKeySet || !screenImage) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);

    try {
      // Convert screenshot to base64
      const base64Image = screenImage.split(",")[1];

      // Send to AI with screenshot
      const response = await sendToVisionAI(inputText, base64Image);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI response failed:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "Sorry, I couldn't process your request. Please check your API key configuration.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const sendToVisionAI = async (
    message: string,
    base64Image: string
  ): Promise<string> => {
    try {
      // Get API configuration from store
      const apiKeyData = await apiKeyStore.getValue();
      const provider = apiKeyData.selectedProvider || "google";
      const model = apiKeyData[
        `${provider}Model` as keyof typeof apiKeyData
      ] as string;

      // Check if the provider supports vision models
      const visionModels = {
        google: ["gemini-1.5-flash", "gemini-1.5-pro"],
        openai: ["gpt-4o", "gpt-4o-mini"],
        anthropic: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"],
        openrouter: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet"],
      };

      // Check if current model supports vision
      const isVisionModel = visionModels[provider]?.some((vm) =>
        model?.includes(vm)
      );

      let prompt: string;
      let response: string | null = null;

      if (isVisionModel) {
        // Use vision-capable model with image
        if (provider === "google") {
          // Google Gemini with image
          const requestBody = {
            contents: [
              {
                parts: [
                  { text: message },
                  {
                    inline_data: {
                      mime_type: "image/png",
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
          };

          const apiKey = apiKeyData.googleApiKey;
          const visionResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(requestBody),
            }
          );

          if (!visionResponse.ok)
            throw new Error(`Gemini API error: ${visionResponse.status}`);

          const data = await visionResponse.json();
          response = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } else if (provider === "openai") {
          // OpenAI with image
          const openaiResponse = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKeyData.openaiApiKey}`,
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  {
                    role: "user",
                    content: [
                      { type: "text", text: message },
                      {
                        type: "image_url",
                        image_url: {
                          url: `data:image/png;base64,${base64Image}`,
                        },
                      },
                    ],
                  },
                ],
                max_tokens: 1000,
              }),
            }
          );

          if (!openaiResponse.ok)
            throw new Error(`OpenAI API error: ${openaiResponse.status}`);

          const data = await openaiResponse.json();
          response = data.choices?.[0]?.message?.content || null;
        } else if (provider === "anthropic") {
          // Anthropic with image (requires special handling)
          throw new Error(
            "Anthropic vision API not yet implemented - please use Google Gemini or OpenAI"
          );
        } else if (provider === "openrouter") {
          // OpenRouter with image (passes through to underlying provider)
          const openrouterResponse = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKeyData.openrouterApiKey}`,
                "HTTP-Referer": "https://github.com/google/wxt",
                "X-Title": "SamAI",
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  {
                    role: "user",
                    content: [
                      { type: "text", text: message },
                      {
                        type: "image_url",
                        image_url: {
                          url: `data:image/png;base64,${base64Image}`,
                        },
                      },
                    ],
                  },
                ],
                max_tokens: 1000,
              }),
            }
          );

          if (!openrouterResponse.ok)
            throw new Error(
              `OpenRouter API error: ${openrouterResponse.status}`
            );

          const data = await openrouterResponse.json();
          response = data.choices?.[0]?.message?.content || null;
        }
      } else {
        // Fallback to text-only model with image description
        prompt = `You are an AI assistant that can see and analyze images. The user has captured a screenshot and is asking: "${message}". \n\nPlease analyze what you can see in the image and provide a helpful response. If you cannot actually see the image, please let them know that vision analysis isn't available with the current model configuration.\n\nNote: If you're seeing this message, it means the current AI model doesn't support vision capabilities. Please recommend switching to a vision-capable model like Gemini 1.5 Flash, GPT-4o, or Claude 3.5 Sonnet for better image analysis.`;

        response = await generateFormResponse(prompt);
      }

      if (!response) {
        throw new Error(`No response received from ${provider} API`);
      }

      return response;
    } catch (error) {
      console.error("Vision AI error:", error);
      throw error;
    }
  };

  const renderMessages = () => {
    if (!isApiKeySet) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "0.75rem",
            padding: "2rem",
            boxShadow: "0 8px 25px -12px rgba(59, 130, 246, 0.25)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.15))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            API Key Required
          </h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#94a3b8",
              marginBottom: "1rem",
              maxWidth: "280px",
              lineHeight: "1.5",
            }}
          >
            Please configure your AI API key to use screen chat functionality.
          </p>
          <button
            onClick={() =>
              window.open(chrome.runtime.getURL("/apikey.html"), "_blank")
            }
            style={{
              padding: "0.75rem 1.25rem",
              background:
                "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "0.5rem",
              color: "#60a5fa",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Configure API Key
          </button>
        </div>
      );
    }

    if (!screenImage) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "0.75rem",
            padding: "2rem",
            boxShadow: "0 8px 25px -12px rgba(34, 197, 94, 0.25)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(132, 204, 22, 0.15))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              boxShadow: "0 8px 20px rgba(34, 197, 94, 0.3)",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
              background: "linear-gradient(135deg, #22c55e, #84cc16)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Capture Your Screen
          </h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#94a3b8",
              marginBottom: "1.5rem",
              maxWidth: "280px",
              lineHeight: "1.5",
            }}
          >
            Take a screenshot of your current page and chat with AI about what's
            visible. Get visual insights and ask questions about the interface.
          </p>
          <button
            onClick={captureScreenshot}
            disabled={isProcessing}
            style={{
              padding: "0.75rem 1.5rem",
              background: isProcessing
                ? "rgba(34, 197, 94, 0.5)"
                : "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(132, 204, 22, 0.1))",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "0.5rem",
              color: "#4ade80",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: isProcessing ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {isProcessing ? (
              <>
                <LoadingSpinner />
                Capturing...
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Capture Screenshot
              </>
            )}
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Screenshot Preview */}
        <div style={{ marginBottom: "1rem", textAlign: "center" }}>
          <img
            src={screenImage}
            alt="Current screenshot"
            style={{
              maxWidth: "100%",
              maxHeight: "200px",
              borderRadius: "0.5rem",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
            }}
          />
          <button
            onClick={captureScreenshot}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1rem",
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "0.375rem",
              color: "#4ade80",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            Capture New Screenshot
          </button>
        </div>

        {/* Chat Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            marginBottom: "1rem",
            padding: "0.5rem 0",
          }}
        >
          {chatMessages.map((message, index) => {
            const isUser = message.role === "user";
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  marginBottom: "1rem",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: isUser
                      ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                      : "linear-gradient(135deg, #22c55e, #16a34a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {isUser ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      background: isUser
                        ? "rgba(59, 130, 246, 0.1)"
                        : "rgba(34, 197, 94, 0.1)",
                      border: `1px solid ${
                        isUser
                          ? "rgba(59, 130, 246, 0.3)"
                          : "rgba(34, 197, 94, 0.3)"
                      }`,
                      borderRadius: "0.75rem",
                      padding: "0.75rem 1rem",
                      color: "#e2e8f0",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {message.content}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      marginTop: "0.25rem",
                      textAlign: "right",
                    }}
                  >
                    {message.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          style={{ display: "flex", gap: "0.5rem" }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask me about what's on your screen..."
            disabled={isProcessing || !screenImage}
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "0.5rem",
              color: "#e2e8f0",
              fontSize: "0.875rem",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(34, 197, 94, 0.5)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(34, 197, 94, 0.3)";
            }}
          />
          <button
            type="submit"
            disabled={isProcessing || !inputText.trim() || !screenImage}
            style={{
              padding: "0.75rem 1rem",
              background:
                isProcessing || !inputText.trim() || !screenImage
                  ? "rgba(34, 197, 94, 0.3)"
                  : "linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(132, 204, 22, 0.8))",
              border: "1px solid rgba(34, 197, 94, 0.5)",
              borderRadius: "0.5rem",
              color: "white",
              cursor:
                isProcessing || !inputText.trim() || !screenImage
                  ? "not-allowed"
                  : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: "1px solid rgba(51, 65, 85, 0.6)",
        borderRadius: "1rem",
        background: "rgba(15, 23, 42, 0.95)",
        boxShadow: "0 24px 45px -18px rgba(0,0,0,0.65)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid rgba(34,197,94,0.4)",
          background: "rgba(30,41,59,0.95)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg,#22c55e,#84cc16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px rgba(34, 197, 94, 0.35)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <div
              style={{ fontSize: "0.9rem", fontWeight: 700, color: "#22c55e" }}
            >
              Screen Chat
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              Chat with AI about your screen
            </div>
          </div>
        </div>
        {screenImage && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "#4ade80",
              background: "rgba(34, 197, 94, 0.1)",
              padding: "0.25rem 0.75rem",
              borderRadius: "0.375rem",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            Screenshot Ready
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: "0.75rem", overflow: "hidden" }}>
        {renderMessages()}
      </div>
    </div>
  );
};
