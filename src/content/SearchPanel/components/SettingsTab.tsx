import React from "react";

const SettingsTab: React.FC = () => {
  return (
    <div
      style={{
        padding: "2rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
        color: "#f1f5f9",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "0.5rem",
          }}
        >
          Settings
        </h2>
        <p style={{ fontSize: "0.95rem", color: "#94a3b8" }}>
          Configure your AI providers and preferences
        </p>
      </div>
      <button
        onClick={() => browser.runtime.sendMessage({ type: "openApiKeyPage" })}
        style={{
          padding: "1rem 2.5rem",
          background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
          color: "white",
          border: "none",
          borderRadius: "1rem",
          fontSize: "1rem",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 8px 25px rgba(79, 70, 229, 0.4)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow =
            "0 12px 35px rgba(79, 70, 229, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 8px 25px rgba(79, 70, 229, 0.4)";
        }}
      >
        🔑 Configure API Key
      </button>
    </div>
  );
};

export default SettingsTab;
