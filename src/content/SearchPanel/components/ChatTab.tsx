import { LoadingSpinner } from "@/src/components/ui/LoadingSpinner";
import { MarkdownRenderer } from "@/utils/markdown";
import type { OutputFormat } from "@/utils/page-content";
import { apiKeyStore } from "@/utils/store";
import React, { useEffect, useState } from "react";
import type { ChatMessage } from "../types";

type ChatSource = "none" | "page" | "html" | "screen";

interface ChatTabProps {
  isApiKeySet: boolean;
  isExtractingContent: boolean;
  isChatLoading: boolean;
  chatMessages: ChatMessage[];
  chatInput: string;
  outputFormat: OutputFormat;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOpenApiKey: () => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  isApiKeySet,
  isExtractingContent,
  isChatLoading,
  chatMessages,
  chatInput,
  outputFormat,
  messagesEndRef,
  onInputChange,
  onSubmit,
  onOpenApiKey,
}) => {
  const [chatSource, setChatSource] = useState<ChatSource>("none");
  const [screenImage, setScreenImage] = useState<string | null>(null);
  const [isCapturingScreen, setIsCapturingScreen] = useState(false);
  const [isVisionApiKeySet, setIsVisionApiKeySet] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Check for vision API key
  useEffect(() => {
    const checkVisionApiKey = async () => {
      try {
        const apiKeyData = await apiKeyStore.getValue();
        setIsVisionApiKeySet(!!apiKeyData.googleVisionApiKey);
      } catch (error) {
        console.error("Error checking Vision API key:", error);
        setIsVisionApiKeySet(false);
      }
    };
    checkVisionApiKey();
  }, []);

  // Screen capture functionality
  const captureScreenshot = async () => {
    try {
      setIsCapturingScreen(true);

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
      setChatSource("screen");
    } catch (error) {
      console.error("Screenshot capture failed:", error);
      alert("Failed to capture screenshot. Please try again.");
    } finally {
      setIsCapturingScreen(false);
    }
  };

  // Vision analysis for screenshots
  const analyzeScreenshot = async (message: string, base64Image: string) => {
    try {
      const apiKeyData = await apiKeyStore.getValue();

      if (!apiKeyData.googleVisionApiKey) {
        throw new Error("Google Cloud Vision API key not configured");
      }

      const visionResponse = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKeyData.googleVisionApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Image,
                },
                features: [
                  { type: "LABEL_DETECTION", maxResults: 10 },
                  { type: "TEXT_DETECTION", maxResults: 10 },
                  { type: "OBJECT_LOCALIZATION", maxResults: 10 },
                  { type: "FACE_DETECTION", maxResults: 5 },
                  { type: "LOGO_DETECTION", maxResults: 5 },
                ],
              },
            ],
          }),
        }
      );

      if (!visionResponse.ok) {
        throw new Error(`Vision API error: ${visionResponse.status}`);
      }

      const visionData = await visionResponse.json();
      const annotations = visionData.responses?.[0];

      if (!annotations) {
        throw new Error("No vision data received");
      }

      // Process vision results for visual elements
      let analysis = "";

      // Detect visual elements
      if (
        annotations.localizedObjectAnnotations &&
        annotations.localizedObjectAnnotations.length > 0
      ) {
        analysis += "**Visual elements I can identify:**\n";
        const topObjects = annotations.localizedObjectAnnotations.slice(0, 5);
        analysis +=
          topObjects.map((obj: any) => `• ${obj.name}`).join("\n") + "\n\n";
      }

      // Detect images and visual content
      const visualLabels = annotations.labelAnnotations?.filter(
        (label: any) => {
          const desc = label.description.toLowerCase();
          const visualTerms = [
            "photo",
            "image",
            "picture",
            "drawing",
            "painting",
            "artwork",
            "diagram",
            "chart",
            "map",
            "portrait",
            "landscape",
            "architecture",
            "building",
            "vehicle",
            "food",
            "nature",
            "flower",
            "tree",
            "mountain",
            "ocean",
            "sky",
            "clouds",
            "screenshot",
          ];
          return (
            visualTerms.some((term) => desc.includes(term)) && label.score > 0.5
          );
        }
      );

      if (visualLabels && visualLabels.length > 0) {
        analysis += "**Visual content I can see:**\n";
        const topVisualLabels = visualLabels.slice(0, 5);
        analysis +=
          topVisualLabels
            .map((label: any) => `• ${label.description}`)
            .join("\n") + "\n\n";
      }

      // Detect logos
      if (
        annotations.logoAnnotations &&
        annotations.logoAnnotations.length > 0
      ) {
        analysis += "**Brands/Logos I can identify:**\n";
        analysis +=
          annotations.logoAnnotations
            .map((logo: any) => `• ${logo.description}`)
            .join("\n") + "\n\n";
      }

      // Detect people
      if (
        annotations.faceAnnotations &&
        annotations.faceAnnotations.length > 0
      ) {
        analysis += `I can see ${annotations.faceAnnotations.length} person${
          annotations.faceAnnotations.length > 1 ? "s" : ""
        } in this image.\n\n`;
      }

      // Detect animals
      if (message.toLowerCase().includes("animal")) {
        const animalLabels = annotations.labelAnnotations?.filter(
          (label: any) =>
            [
              "cat",
              "dog",
              "bird",
              "fish",
              "horse",
              "cow",
              "pig",
              "sheep",
              "goat",
              "rabbit",
              "bear",
              "lion",
              "tiger",
              "elephant",
              "giraffe",
              "zebra",
              "kangaroo",
              "penguin",
              "dolphin",
              "whale",
              "shark",
            ].includes(label.description.toLowerCase())
        );

        if (animalLabels && animalLabels.length > 0) {
          analysis += `I can see **${animalLabels[0].description}** in your screenshot.\n\n`;
        } else {
          analysis +=
            "I don't see any animals clearly visible in this screenshot.\n\n";
        }
      }

      // Always extract text from screenshot (critical feature)
      if (
        annotations.textAnnotations &&
        annotations.textAnnotations.length > 0
      ) {
        const fullText = annotations.textAnnotations[0]?.description || "";
        if (fullText.trim()) {
          analysis += "**Text content visible in screenshot:**\n";
          // Show key parts of the text (first 200 chars to avoid overwhelming)
          const textPreview = fullText.trim().substring(0, 200);
          analysis += `${textPreview}${fullText.length > 200 ? "..." : ""}\n\n`;
        }
      }

      analysis += "**Complete Analysis Summary:**\n";
      analysis +=
        "I've analyzed the visual elements in your screenshot. This screen contains various visual content, UI components, or interface elements that I can identify.";

      return analysis;
    } catch (error) {
      console.error("Vision analysis error:", error);
      throw error;
    }
  };

  // Enhanced submit handler that includes screenshot analysis
  const handleSubmitWithScreenshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApiKeySet || !chatInput.trim() || isChatLoading) return;

    // Handle screenshot source differently
    if (chatSource === "screen" && screenImage) {
      try {
        setIsExtractingContent(true);
        const base64Image = screenImage.split(",")[1];
        const visionAnalysis = await analyzeScreenshot(chatInput, base64Image);

        // Create enhanced prompt with vision analysis
        const enhancedPrompt = `${chatInput}\n\n**Screenshot Analysis Context:**\n${visionAnalysis}\n\nPlease respond to the user's question about the current screenshot, focusing on what I can see visually.`;

        // Now call parent submit with enhanced context
        onSubmit(e, enhancedPrompt);
      } catch (error) {
        console.error("Error analyzing screenshot:", error);
        // Fall back to regular submit
        onSubmit(e);
      } finally {
        setIsExtractingContent(false);
      }
    } else {
      // Regular submit for non-screenshot sources
      onSubmit(e);
    }
  };

  const renderMessages = () => {
    if (chatMessages.length === 0) {
      return (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          <div>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
              }}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#34d399"
                strokeWidth="2.2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                marginBottom: "0.35rem",
                color: "#e2e8f0",
              }}
            >
              Unified Chat Assistant
            </div>
            <p style={{ fontSize: "0.85rem" }}>
              Choose your chat source below and ask anything about the page or
              your screen.
            </p>
          </div>
        </div>
      );
    }

    return chatMessages.map((message, index) => {
      const isUser = message.role === "user";
      return (
        <div
          key={`${message.timestamp}-${index}`}
          style={{
            display: "flex",
            justifyContent: isUser ? "flex-end" : "flex-start",
            marginBottom: "0.75rem",
          }}
        >
          <div
            style={{
              maxWidth: "85%",
              background: isUser
                ? "linear-gradient(135deg,#3b82f6,#60a5fa)" // Changed from green to blue
                : "linear-gradient(135deg,rgba(30,41,59,0.95), rgba(51,65,85,0.95))",
              color: isUser ? "#fff" : "#e2e8f0",
              padding: "0.85rem 1rem",
              borderRadius: "1rem",
              border: `1px solid ${
                isUser ? "rgba(59, 130, 246, 0.4)" : "rgba(71,85,105,0.6)"
              }`,
              boxShadow: isUser
                ? "0 10px 22px rgba(59, 130, 246, 0.35)" // Blue shadow instead of green
                : "0 12px 22px rgba(0,0,0,0.35)",
            }}
          >
            {isUser ? (
              <div style={{ fontSize: "0.95rem", lineHeight: 1.5 }}>
                {message.content}
              </div>
            ) : (
              <div style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                <MarkdownRenderer content={message.content} />
              </div>
            )}
            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.75rem",
                color: isUser
                  ? "rgba(255,255,255,0.8)"
                  : "rgba(148,163,184,0.9)",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              {message.timestamp}
            </div>
          </div>
        </div>
      );
    });
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
          borderBottom: "1px solid rgba(51,65,85,0.4)",
          background: "rgba(30,41,59,0.95)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg,#10b981,#34d399)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px rgba(16,185,129,0.35)",
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <div
              style={{ fontSize: "0.9rem", fontWeight: 700, color: "#34d399" }}
            >
              Unified Chat Assistant
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              Chat with page content or screenshots
            </div>
          </div>
        </div>
        {isExtractingContent && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.3rem 0.8rem",
              borderRadius: "999px",
              border: "1px solid rgba(16,185,129,0.35)",
              background: "rgba(16,185,129,0.12)",
              fontSize: "0.7rem",
              color: "#6ee7b7",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                border: "2px solid rgba(16,185,129,0.5)",
                borderTopColor: "#34d399",
                animation: "samai-spin 0.6s linear infinite",
              }}
            />
            Processing…
          </div>
        )}
      </div>

      {!isApiKeySet ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div>
            <div
              style={{
                width: "70px",
                height: "70px",
                margin: "0 auto 1rem",
                borderRadius: "18px",
                background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 14px 26px rgba(245,158,11,0.35)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#fcd34d",
                marginBottom: "0.5rem",
              }}
            >
              API key required
            </div>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#cbd5f5",
                marginBottom: "1.25rem",
              }}
            >
              Configure your Gemini API key to start chatting with page context
              or screenshots.
            </p>
            <button
              onClick={onOpenApiKey}
              style={{
                padding: "0.8rem 1.6rem",
                borderRadius: "0.85rem",
                background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
                border: "none",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 12px 24px rgba(245,158,11,0.35)",
              }}
            >
              Configure API key
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              flex: 1,
              padding: "0.75rem",
              overflowY: "auto",
              minHeight: 0,
            }}
          >
            {renderMessages()}
            {(isChatLoading || isExtractingContent) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginTop: "0.5rem",
                }}
              >
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "1rem",
                    border: "1px solid rgba(71,85,105,0.5)",
                    background: "rgba(30,41,59,0.85)",
                    color: "#34d399",
                    fontSize: "0.85rem",
                  }}
                >
                  {isExtractingContent
                    ? "Reading page content…"
                    : "AI is thinking…"}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: "0.75rem",
              borderTop: "1px solid rgba(51,65,85,0.4)",
              background: "rgba(30,41,59,0.95)",
            }}
          >
            <form
              onSubmit={onSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {/* Source Selection */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.25rem",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#cbd5f5",
                    marginRight: "0.5rem",
                  }}
                >
                  Chat source:
                </span>
                <select
                  value={chatSource}
                  onChange={(e) => setChatSource(e.target.value as ChatSource)}
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.375rem",
                    border: "1px solid rgba(71,85,105,0.6)",
                    background: "rgba(15,23,42,0.9)",
                    color: "#f1f5f9",
                    cursor: "pointer",
                  }}
                >
                  <option value="none">No source</option>
                  <option value="page">Page text</option>
                  <option value="html">HTML content</option>
                  <option value="screen">Screen</option>
                </select>

                {chatSource === "screen" && (
                  <button
                    type="button"
                    onClick={captureScreenshot}
                    disabled={isCapturingScreen || !isVisionApiKeySet}
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "0.375rem",
                      border: "1px solid rgba(34,197,94,0.3)",
                      background: isCapturingScreen
                        ? "rgba(34,197,94,0.3)"
                        : "rgba(34,197,94,0.1)",
                      color: "#4ade80",
                      fontSize: "0.75rem",
                      cursor:
                        isCapturingScreen || !isVisionApiKeySet
                          ? "not-allowed"
                          : "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {isCapturingScreen ? "Capturing..." : "Capture Screen"}
                  </button>
                )}

                {!isVisionApiKeySet && chatSource === "screen" && (
                  <span style={{ fontSize: "0.7rem", color: "#f59e0b" }}>
                    (Need Google Vision API key)
                  </span>
                )}
              </div>

              {screenImage && chatSource === "screen" && (
                <div style={{ marginBottom: "0.5rem", textAlign: "center" }}>
                  <img
                    src={screenImage}
                    alt="Current screenshot"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "120px",
                      borderRadius: "0.375rem",
                      border: "1px solid rgba(34,197,94,0.3)",
                      boxShadow: "0 2px 8px rgba(34,197,94,0.2)",
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => onInputChange(e.target.value)}
                    placeholder={
                      chatSource === "screen"
                        ? "Ask about the screenshot..."
                        : chatSource === "page"
                        ? "Ask about this page…"
                        : chatSource === "html"
                        ? "Ask about the HTML content…"
                        : "Ask anything…"
                    }
                    disabled={isChatLoading || isExtractingContent}
                    style={{
                      width: "100%",
                      height: "48px",
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(71,85,105,0.6)",
                      background: "rgba(15,23,42,0.9)",
                      color: "#f1f5f9",
                      padding: "0 1rem 0 1rem",
                      fontSize: "0.9rem",
                      transition: "all 0.2s",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(59, 130, 246, 0.6)";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(59, 130, 246, 0.2)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(71,85,105,0.6)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  {(isChatLoading || isExtractingContent) && (
                    <div
                      style={{
                        position: "absolute",
                        right: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <LoadingSpinner size="sm" color="success" />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={
                    isChatLoading || isExtractingContent || !chatInput.trim()
                  }
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "0.75rem",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: chatInput.trim()
                      ? "linear-gradient(135deg, #10b981, #34d399)"
                      : "linear-gradient(135deg, #6b7280, #9ca3af)",
                    color: "#fff",
                    cursor: chatInput.trim() ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    boxShadow: chatInput.trim()
                      ? "0 4px 16px rgba(16, 185, 129, 0.4)"
                      : "none",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
