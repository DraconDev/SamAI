import React, { useState } from "react";

interface FloatingSettingsButtonProps {
  onClick: () => void;
}

export default function FloatingSettingsButton({ onClick }: FloatingSettingsButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-[#4f46e5] to-[#818cf8] text-white rounded-full shadow-2xl hover:shadow-[#4f46e5]/30 transition-all duration-300 hover:scale-110 group"
      style={{
        boxShadow: isHovered 
          ? '0 20px 40px rgba(79, 70, 229, 0.4), 0 0 20px rgba(79, 70, 229, 0.3)' 
          : '0 10px 30px rgba(79, 70, 229, 0.3)'
      }}
    >
      {/* Settings Icon */}
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={`transition-transform duration-300 ${isHovered ? 'rotate-90' : ''}`}
      >
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6M1 12h6m6 0h6M4.22 4.22l4.24 4.24m7.07 7.07l4.24 4.24m0-7.07l-4.24 4.24m-7.07 7.07l-4.24 4.24"/>
      </svg>
      
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-16 right-0 bg-[#1a1b2e] border border-[#2E2F3E]/50 rounded-lg px-3 py-2 text-sm text-gray-200 whitespace-nowrap shadow-xl backdrop-blur-sm">
          Search Settings
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#2E2F3E]/50"></div>
        </div>
      )}
      
      {/* Animated ring */}
      <div className="absolute inset-0 border-2 rounded-full border-white/30 animate-ping"></div>
      <div className="absolute inset-0 border rounded-full border-white/20 animate-pulse" style={{ animationDuration: '2s' }}></div>
    </button>
  );
}