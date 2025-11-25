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
      gradient: "from-indigo-500 to-indigo-600",
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
      gradient: "from-blue-500 to-blue-600",
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
      gradient: "from-emerald-500 to-emerald-600",
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
      gradient: "from-amber-500 to-amber-600",
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
      gradient: "from-purple-500 to-purple-600",
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
      gradient: "from-pink-500 to-pink-600",
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

  const TabButton: React.FC<{ tab: Tab; className?: string }> = ({
    tab,
    className,
  }) => {
    const isActive = activeTab === tab.id;
    
    return (
      <button
        onClick={() => handleTabClick(tab)}
        className={`
          flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer
          ${isActive 
            ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg transform scale-105` 
            : 'bg-slate-800/40 text-slate-400 border border-slate-700/30 hover:bg-slate-700/50 hover:text-slate-300'
          }
          ${className || ''}
        `}
        style={isActive ? {
          boxShadow: `0 20px 25px -5px ${tab.shadow}, 0 10px 10px -5px ${tab.shadow}`
        } : {}}
      >
        {tab.icon}
        <span>{tab.label}</span>
      </button>
    );
  };

  return (
    <div className="grid grid-cols-4 gap-1.5 mb-6 p-2.5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl">
      {/* Row 1 - Main Actions */}
      {mainTabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
        />
      ))}

      {/* Row 2 - Secondary Actions */}
      <div className="col-span-4 grid grid-cols-2 gap-1.5 mt-1.5">
        {secondaryTabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            className="col-span-1"
          />
        ))}
      </div>
    </div>
  );
};
