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
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  onChatClick,
  onSummarizeClick,
  onFormClick,
  onImageClick,
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

  // Gradient color mapping
  const gradientColors: Record<string, { from: string; to: string }> = {
    'from-indigo-500 to-indigo-600': { from: '#6366f1', to: '#4f46e5' },
    'from-blue-500 to-blue-600': { from: '#3b82f6', to: '#2563eb' },
    'from-emerald-500 to-emerald-600': { from: '#10b981', to: '#059669' },
    'from-amber-500 to-amber-600': { from: '#f59e0b', to: '#d97706' },
    'from-purple-500 to-purple-600': { from: '#a855f7', to: '#9333ea' },
    'from-pink-500 to-pink-600': { from: '#ec4899', to: '#db2777' },
  };

  const TabButton: React.FC<{ tab: Tab; className?: string }> = ({
    tab,
    className,
  }) => {
    const isActive = activeTab === tab.id;
    const gradient = gradientColors[tab.gradient] || { from: '#6366f1', to: '#4f46e5' };
    
    const baseButtonStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      borderRadius: '0.875rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
      position: 'relative',
      overflow: 'hidden',
      letterSpacing: '0.025em',
    };

    const activeStyle: React.CSSProperties = {
      ...baseButtonStyle,
      background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
      color: 'white',
      boxShadow: `0 10px 25px -5px ${tab.shadow}, 0 4px 12px -2px ${tab.shadow}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
      transform: 'translateY(-1px) scale(1.02)',
      border: `1px solid rgba(255, 255, 255, 0.2)`,
    };

    const inactiveStyle: React.CSSProperties = {
      ...baseButtonStyle,
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
      color: '#94a3b8',
      border: '1px solid rgba(51, 65, 85, 0.4)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    };
    
    return (
      <button
        onClick={() => handleTabClick(tab)}
        style={isActive ? activeStyle : inactiveStyle}
        className={className}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(51, 65, 85, 0.7), rgba(30, 41, 59, 0.9))';
            e.currentTarget.style.color = '#cbd5e1';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.6)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = inactiveStyle.background as string;
            e.currentTarget.style.color = inactiveStyle.color as string;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = inactiveStyle.boxShadow as string;
            e.currentTarget.style.borderColor = inactiveStyle.border as string;
          }
        }}
      >
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          filter: isActive ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' : 'none'
        }}>
          {tab.icon}
        </span>
        <span style={{ 
          textShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.2)' : 'none'
        }}>
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        padding: '0.75rem',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
        borderRadius: '1rem',
        border: '1px solid rgba(51, 65, 85, 0.6)',
        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Row 1 - Main Actions */}
      {mainTabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
        />
      ))}

      {/* Row 2 - Secondary Actions */}
      <div
        style={{
          gridColumn: 'span 4',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.5rem',
          marginTop: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid rgba(51, 65, 85, 0.4)',
        }}
      >
        {secondaryTabs.map((tab) => (
          <div key={tab.id} style={{ gridColumn: 'span 1' }}>
            <TabButton
              tab={tab}
            />
          </div>
        ))}     
      </div>
    </div>
  );
};
