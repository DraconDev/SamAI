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
          "Screenshot captured! Ask me about the visual elements - pictures, images, UI components, or anything you can see on screen.",
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

      let response: string | null = null;

      // Use Google Cloud Vision API for image analysis
      if (provider === "google" && apiKeyData.googleVisionApiKey) {
        try {
          // Google Cloud Vision API
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
                      { type: "LANDMARK_DETECTION", maxResults: 5 },
                      { type: "LOGO_DETECTION", maxResults: 5 },
                      { type: "SAFE_SEARCH_DETECTION", maxResults: 5 },
                    ],
                  },
                ],
              }),
            }
          );

          if (!visionResponse.ok) {
            throw new Error(
              `Google Cloud Vision API error: ${visionResponse.status}`
            );
          }

          const visionData = await visionResponse.json();

          // Process the vision results
          const visionResults = processVisionResults(visionData, message);
          response = visionResults;
        } catch (visionError) {
          console.error("Google Cloud Vision API error:", visionError);
          const errorMessage =
            visionError instanceof Error
              ? visionError.message
              : String(visionError);
          throw new Error(
            `Vision API error: ${errorMessage}. Please check your Google Cloud Vision API key and try again.`
          );
        }
      } else if (
        provider === "google" &&
        !apiKeyData.googleVisionApiKey &&
        apiKeyData.googleApiKey
      ) {
        // Has Google AI key but no Vision API key
        const fallbackResponse = await generateFormResponse(
          `You are analyzing a visual screenshot. The user asks: "${message}". Focus on what visual elements, images, UI components, or visual content you can see. This is about visual analysis, not text content. Note: Google Cloud Vision API not configured - this is a text-based analysis.`
        );
        response = fallbackResponse;
      } else {
        // Non-Google providers or no API key - use text model with description
        const prompt = `You are analyzing a visual screenshot. The user asks: "${message}". Please focus on visual elements like images, photos, UI components, people, animals, logos, charts, diagrams, or any visual content. This is for visual analysis of what's on screen. Note: This is a text-only analysis since Google Cloud Vision API is not available.`;

        response = await generateFormResponse(prompt);
      }

      if (!response) {
        throw new Error("No response received from vision analysis");
      }

      return response;
    } catch (error) {
      console.error("Vision AI error:", error);
      throw error;
    }
  };

  // Focus on visual elements - not text content
  const processVisionResults = (
    visionData: any,
    userQuestion: string
  ): string => {
    try {
      const annotations = visionData.responses?.[0];
      if (!annotations) {
        return "I couldn't analyze the image. Please try again.";
      }

      let analysis = "";

      // Visual content first - what makes Screen mode special

      // Detect animals - very visual content
      if (userQuestion.toLowerCase().includes("animal")) {
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
              "hamster",
              "mouse",
              "rat",
              "monkey",
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
              "frog",
              "snake",
              "lizard",
              "turtle",
              "spider",
              "butterfly",
              "bee",
              "ant",
            ].includes(label.description.toLowerCase())
        );

        if (animalLabels && animalLabels.length > 0) {
          analysis = `I can see **${animalLabels[0].description}** in your screenshot`;
          if (animalLabels.length > 1) {
            const otherAnimals = animalLabels
              .slice(1)
              .map((a: any) => a.description)
              .join(", ");
            analysis += ` (and possibly ${otherAnimals})`;
          }
          analysis += `.\n\n`;
        } else {
          analysis +=
            "I don't see any animals clearly visible in this screenshot.\n\n";
        }
      }

      // Detect people - very visual
      if (
        userQuestion.toLowerCase().includes("person") ||
        userQuestion.toLowerCase().includes("people") ||
        userQuestion.toLowerCase().includes("face")
      ) {
        if (
          annotations.faceAnnotations &&
          annotations.faceAnnotations.length > 0
        ) {
          analysis += `I can see ${annotations.faceAnnotations.length} person${
            annotations.faceAnnotations.length > 1 ? "s" : ""
          } in this image.\n\n`;
        } else {
          analysis +=
            "I don't see any people clearly visible in this screenshot.\n\n";
        }
      }

      // Visual objects and UI elements - this is what Screen mode should focus on
      if (
        annotations.localizedObjectAnnotations &&
        annotations.localizedObjectAnnotations.length > 0
      ) {
        analysis += "**Visual elements I can identify:**\n";
        const topObjects = annotations.localizedObjectAnnotations.slice(0, 5);
        analysis +=
          topObjects.map((obj: any) => `• ${obj.name}`).join("\n") + "\n\n";
      }

      // Images, photos, visuals - the main reason for Screen mode
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
            "logo",
            "icon",
            "button",
            "interface",
            "layout",
            "design",
            "style",
            "color",
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

      // Logos/websites - visual branding
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

      // UI elements and interface - visual layout
      if (
        userQuestion.toLowerCase().includes("interface") ||
        userQuestion.toLowerCase().includes("ui") ||
        userQuestion.toLowerCase().includes("button") ||
        userQuestion.toLowerCase().includes("menu")
      ) {
        if (
          annotations.localizedObjectAnnotations &&
          annotations.localizedObjectAnnotations.length > 0
        ) {
          analysis += "**Interface elements I can see:**\n";
          const uiElements = annotations.localizedObjectAnnotations.filter(
            (obj: any) => {
              const name = obj.name.toLowerCase();
              return [
                "button",
                "menu",
                "tab",
                "link",
                "form",
                "input",
                "checkbox",
                "radio",
                "slider",
                "dropdown",
                "window",
                "dialog",
              ].some((ui) => name.includes(ui));
            }
          );
          if (uiElements.length > 0) {
            analysis +=
              uiElements.map((obj: any) => `• ${obj.name}`).join("\n") + "\n\n";
          } else {
            analysis +=
              "I can see various interface elements and UI components.\n\n";
          }
        }
      }

      // Only show minimal text info if specifically asked
      if (
        userQuestion.toLowerCase().includes("text") ||
        userQuestion.toLowerCase().includes("read")
      ) {
        if (
          annotations.textAnnotations &&
          annotations.textAnnotations.length > 0
        ) {
          const fullText = annotations.textAnnotations[0]?.description || "";
          if (fullText.trim()) {
            analysis += "**Some readable text is visible** in the image.\n\n";
          }
        }
      }

      // Provide visual-focused conclusion
      analysis += "**Visual Summary:**\n";
      if (
        userQuestion.toLowerCase().includes("what") &&
        userQuestion.toLowerCase().includes("see")
      ) {
        analysis +=
          "I can see the visual elements described above. This screen contains various visual content, UI components, or interface elements that I can identify.";
      } else if (userQuestion.toLowerCase().includes("help")) {
        analysis +=
          "I can help you understand the visual layout, identify interface elements, describe images or photos, or explain what's visually displayed on your screen.";
      } else {
        analysis +=
          "I've identified the visual elements in your screenshot. For text content analysis, you can use the regular Chat tab which analyzes page content more thoroughly.";
      }

      return analysis;
    } catch (error) {
      console.error("Error processing vision results:", error);
      return "I had trouble analyzing the visual elements, but I can see this is a screenshot.";
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
            Visual Screen Analysis
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
            Capture a screenshot to analyze visual elements like images, UI
            components, interface layout, and visual content. For text analysis,
            use the Chat tab.
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
            placeholder="Ask about visual elements, images, UI components..."
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
              Visual Screen Chat
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              Analyze visual elements & interface
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
            Visual Ready
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: "0.75rem", overflow: "hidden" }}>
        {renderMessages()}
      </div>
    </div>
  );
};
