import React from "react";
import type { TabId } from "../types";

interface Tab {
  id: TabId;
  label: string;
  gradient: string;
  shadow: string;
  icon: React.ReactNode;
  handler?: () => void;
  disabled?: boolean;
}

interface TabNavigationProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onChatClick?: () => void;
  onSummarizeClick?: () => void;
  onFormClick?: () => void;
  onImageClick?: () => void;
  isScraping?: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  onChatClick,
  onSummarizeClick,
  onFormClick,
  onImageClick,
  isScraping = false,
}) => {
  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab.id);
    if (tab.handler) {
      tab.handler();
    }
  };

  const mainTabs: Tab[] = [
    {
      id: "search",
      label: "Search",
      gradient: "linear-gradient(90deg, #4f46e5, #6366f1, #818cf8)",
      shadow: "rgba(79, 70, 229, 0.5)",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      ),
    },
    {
      id: "scrape",
      label: "Scrape",
      gradient: "linear-gradient(90deg, #3b82f6, #2563eb, #60a5fa)",
      shadow: "rgba(59, 130, 246, 0.5)",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      id: "chat",
      label: "Chat",
      gradient: "linear-gradient(90deg, #10b981, #059669, #34d399)",
      shadow: "rgba(16, 185, 129, 0.5)",
      handler: onChatClick,
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: "sum",
      label: "Sum",
      gradient: "linear-gradient(90deg, #f59e0b, #d97706, #fbbf24)",
      shadow: "rgba(245, 158, 11, 0.5)",
      handler: onSummarizeClick,
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="21" y1="10" x2="3" y2="10" />
          <line x1="21" y1="6" x2="3" y2="6" />
          <line x1="21" y1="14" x2="3" y2="14" />
          <line x1="21" y1="18" x2="3" y2="18" />
        </svg>
      ),
    },
  ];

  const secondaryTabs: Tab[] = [
    {
      id: "form",
      label: "Form",
      gradient: "linear-gradient(90deg, #8b5cf6, #7c3aed, #a78bfa)",
      shadow: "rgba(139, 92, 246, 0.5)",
      handler: onFormClick,
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
    },
    {
      id: "image",
      label: "Image",
      gradient: "linear-gradient(90deg, #ec4899, #db2777, #f472b6)",
      shadow: "rgba(236, 72, 153, 0.5)",
      handler: onImageClick,
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
  ];

  const TabButton: React.FC<{ tab: Tab; style?: any; className?: string }> = ({
    tab,
    style,
    className,
  }) => (
    <button
      onClick={() => handleTabClick(tab)}
      style={style}
      className={className}
    >
      {tab.icon}
      <span>{tab.label}</span>
    </button>
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "6px",
        marginBottom: "24px",
        padding: "10px",
        background: "linear-gradient(135deg, #0D0E16, #1a1b2e)",
        borderRadius: "16px",
        border: "1px solid #2E2F3E",
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Row 1 - Main Actions */}
      {mainTabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "10px 12px",
            borderRadius: "12px",
            fontWeight: 700,
            fontSize: "13px",
            border:
              activeTab === tab.id ? "none" : "1px solid rgba(46, 47, 62, 0.3)",
            background:
              activeTab === tab.id ? tab.gradient : "rgba(30, 31, 46, 0.4)",
            color: activeTab === tab.id ? "white" : "#9ca3af",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow:
              activeTab === tab.id
                ? `0 20px 25px -5px ${tab.shadow}, 0 10px 10px -5px ${tab.shadow}`
                : "none",
            transform: activeTab === tab.id ? "scale(1.02)" : "scale(1)",
          }}
        />
      ))}

      {/* Row 2 - Secondary Actions */}
      {secondaryTabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          style={{
            gridColumn: tab.id === "form" ? "span 2" : "span 2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "10px 12px",
            borderRadius: "12px",
            fontWeight: 700,
            fontSize: "13px",
            border:
              activeTab === tab.id ? "none" : "1px solid rgba(46, 47, 62, 0.3)",
            background:
              activeTab === tab.id ? tab.gradient : "rgba(30, 31, 46, 0.4)",
            color: activeTab === tab.id ? "white" : "#9ca3af",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow:
              activeTab === tab.id
                ? `0 20px 25px -5px ${tab.shadow}, 0 10px 10px -5px ${tab.shadow}`
                : "none",
            transform: activeTab === tab.id ? "scale(1.02)" : "scale(1)",
          }}
        />
      ))}
    </div>
  );
};
