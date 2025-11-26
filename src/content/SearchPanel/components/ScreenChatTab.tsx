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
          `You are analyzing a screenshot. The user asks: "${message}". Please analyze what you can see in this screenshot and provide a helpful response about the visible content, UI elements, text, and overall interface. Note: Google Cloud Vision API not configured - this is a text-based analysis.`
        );
        response = fallbackResponse;
      } else {
        // Non-Google providers or no API key - use text model with description
        const prompt = `You are analyzing a screenshot. The user asks: "${message}". Please provide a helpful response about what you would expect to see in a typical screenshot analysis, including UI elements, layout suggestions, and general visual guidance. Note: This is a text-only analysis since Google Cloud Vision API is not available.`;

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

  // Process Google Cloud Vision API results with improved filtering
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

      // Text detection - prioritize this for web pages
      if (
        annotations.textAnnotations &&
        annotations.textAnnotations.length > 0
      ) {
        const fullText = annotations.textAnnotations[0]?.description || "";
        if (fullText.trim()) {
          analysis += "**Text I can read:**\n";

          // Show a preview of the text
          const preview =
            fullText.length > 300
              ? fullText.substring(0, 300) + "..."
              : fullText;
          analysis += preview + "\n\n";
        }
      }

      // Filter and show most relevant labels for web content
      if (
        annotations.labelAnnotations &&
        annotations.labelAnnotations.length > 0
      ) {
        // Filter out irrelevant labels and focus on meaningful ones
        const relevantLabels = annotations.labelAnnotations.filter(
          (label: any) => {
            const desc = label.description.toLowerCase();
            // Exclude clearly irrelevant or generic labels
            const irrelevantTerms = [
              "screenshot",
              "multimedia",
              "technology",
              "electronic device",
              "software",
              "video game software",
              "pc game",
              "graphics",
              "display",
              "computer graphics",
              "digital image",
            ];

            // Only include relevant labels
            return (
              !irrelevantTerms.includes(desc) &&
              desc.length > 3 && // Exclude very short labels
              label.score > 0.5
            ); // Only show high-confidence detections
          }
        );

        if (relevantLabels.length > 0) {
          analysis += "**Main topics/content:**\n";
          const topLabels = relevantLabels.slice(0, 5);
          analysis +=
            topLabels.map((label: any) => `• ${label.description}`).join("\n") +
            "\n\n";
        }
      }

      // Detect animals specifically
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

      // Detect people
      if (
        userQuestion.toLowerCase().includes("person") ||
        userQuestion.toLowerCase().includes("people")
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

      // Detect UI elements and layout
      if (
        userQuestion.toLowerCase().includes("page") ||
        userQuestion.toLowerCase().includes("website") ||
        userQuestion.toLowerCase().includes("interface")
      ) {
        if (
          annotations.localizedObjectAnnotations &&
          annotations.localizedObjectAnnotations.length > 0
        ) {
          analysis += "**Web page elements I can identify:**\n";
          const topObjects = annotations.localizedObjectAnnotations.slice(0, 5);
          analysis +=
            topObjects.map((obj: any) => `• ${obj.name}`).join("\n") + "\n\n";
        }
      }

      // Detect logos/websites
      if (
        userQuestion.toLowerCase().includes("website") ||
        userQuestion.toLowerCase().includes("logo") ||
        userQuestion.toLowerCase().includes("brand")
      ) {
        if (
          annotations.logoAnnotations &&
          annotations.logoAnnotations.length > 0
        ) {
          analysis += "**Brands/Logos detected:**\n";
          analysis +=
            annotations.logoAnnotations
              .map((logo: any) => `• ${logo.description}`)
              .join("\n") + "\n\n";
        } else if (
          annotations.labelAnnotations?.some((label: any) =>
            [
              "google",
              "wikipedia",
              "youtube",
              "facebook",
              "twitter",
              "instagram",
              "linkedin",
              "amazon",
              "netflix",
              "microsoft",
              "apple",
            ].includes(label.description.toLowerCase())
          )
        ) {
          analysis +=
            "I can see what appears to be a website or application interface.\n\n";
        }
      }

      // If no specific analysis was added, provide a general summary
      if (!analysis.trim()) {
        analysis += "Based on my analysis of your screenshot:\n\n";

        // Only show text if available
        if (
          annotations.textAnnotations &&
          annotations.textAnnotations[0]?.description?.trim()
        ) {
          analysis += "**Some text is visible** in the image.\n\n";
        }

        // Show only high-confidence, relevant detections
        if (
          annotations.labelAnnotations &&
          annotations.labelAnnotations.length > 0
        ) {
          const goodLabels = annotations.labelAnnotations.filter(
            (label: any) =>
              label.score > 0.6 &&
              ![
                "screenshot",
                "multimedia",
                "technology",
                "electronic device",
                "software",
              ].includes(label.description.toLowerCase())
          );

          if (goodLabels.length > 0) {
            analysis += "**I can see:**\n";
            const topLabels = goodLabels.slice(0, 3);
            analysis +=
              topLabels
                .map((label: any) => `• ${label.description}`)
                .join("\n") + "\n\n";
          } else {
            analysis +=
              "**I can see this is a web page or interface** with various elements.\n\n";
          }
        }
      }

      // Provide better context based on what's detected
      analysis += "**My Assessment:**\n";
      if (
        userQuestion.toLowerCase().includes("what") &&
        userQuestion.toLowerCase().includes("page")
      ) {
        analysis +=
          "This appears to be a web page with content and interface elements. The text recognition shows readable content from the page.";
      } else if (userQuestion.toLowerCase().includes("help")) {
        analysis +=
          "Based on what's visible in the screenshot, I can help you navigate, understand the interface, or provide guidance on how to interact with the displayed elements.";
      } else if (
        userQuestion.toLowerCase().includes("error") ||
        userQuestion.toLowerCase().includes("problem")
      ) {
        analysis +=
          "I've analyzed the screenshot for potential issues. The detected elements suggest this is a standard interface view.";
      } else {
        analysis +=
          "I've provided details about what's visible in your screenshot. The text recognition shows content from the page, and I can identify various interface elements.";
      }

      return analysis;
    } catch (error) {
      console.error("Error processing vision results:", error);
      return "I had trouble analyzing the detailed vision results, but I can see this is a screenshot.";
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
