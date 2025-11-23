import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
};

const colors = {
  primary: 'border-[#818cf8]/30 border-t-[#818cf8]',
  secondary: 'border-[#60a5fa]/30 border-t-[#60a5fa]',
  success: 'border-[#34d399]/30 border-t-[#34d399]',
  warning: 'border-[#fbbf24]/30 border-t-[#fbbf24]',
  danger: 'border-[#f87171]/30 border-t-[#f87171]',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  return (
    <div
      className={`
        ${sizes[size]} 
        border-2 rounded-full border-solid 
        ${colors[color]}
        animate-spin
        ${className}
      `}
    />
  );
};