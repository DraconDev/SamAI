import React from 'react';

interface ImageTabProps {
  onImageClick: () => void;
}

export const ImageTab: React.FC<ImageTabProps> = ({ onImageClick }) => {
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
              background: "linear-gradient(135deg,#ec4899,#db2777)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px rgba(236, 72, 153, 0.35)",
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div>
            <div
              style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ec4899" }}
            >
              Image Generation
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              AI-powered image creation tools
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: "0.75rem",
          overflowY: "auto",
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
            border: "1px solid rgba(236, 72, 153, 0.3)",
            borderRadius: "0.75rem",
            padding: "1.5rem",
            boxShadow: "0 8px 25px -12px rgba(236, 72, 153, 0.25)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.15))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
              border: "1px solid rgba(236, 72, 153, 0.3)",
              boxShadow: "0 8px 20px rgba(236, 72, 153, 0.3)",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ec4899"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
              background: "linear-gradient(135deg, #ec4899, #db2777)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Image Generation
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1.5rem", maxWidth: "280px", lineHeight: "1.5" }}>
            Quick access to image generation tools powered by advanced AI models. Create custom images based on your prompts and page context.
          </p>
          <div
            style={{
              padding: "0.75rem 1.25rem",
              background: "rgba(236, 72, 153, 0.1)",
              border: "1px solid rgba(236, 72, 153, 0.3)",
              borderRadius: "0.5rem",
              color: "#f472b6",
              fontSize: "0.8rem",
              fontWeight: 500,
            }}
          >
            🚧 Feature in development
          </div>
        </div>
      </div>
    </div>
  );
};