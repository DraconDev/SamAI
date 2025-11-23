import React from 'react';

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
}

const variants = {
  primary: 'from-[#4f46e5] to-[#818cf8] hover:shadow-[#4f46e5]/30',
  secondary: 'from-[#3b82f6] to-[#60a5fa] hover:shadow-[#3b82f6]/30',
  success: 'from-[#10b981] to-[#34d399] hover:shadow-[#10b981]/30',
  warning: 'from-[#f59e0b] to-[#fbbf24] hover:shadow-[#f59e0b]/30',
  danger: 'from-[#ef4444] to-[#f87171] hover:shadow-[#ef4444]/30',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        bg-gradient-to-r ${variants[variant]} 
        text-white font-semibold rounded-xl
        transition-all duration-300 transform hover:scale-[1.02]
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1b2e]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        shadow-lg hover:shadow-xl
        ${sizes[size]}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};