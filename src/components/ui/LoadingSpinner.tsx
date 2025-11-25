import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const sizes = {
  sm: { width: '1rem', height: '1rem' },
  md: { width: '1.5rem', height: '1.5rem' }, 
  lg: { width: '2rem', height: '2rem' },
};

const colors = {
  primary: { borderColor: 'rgba(129, 140, 248, 0.3)', borderTopColor: '#818cf8' },
  secondary: { borderColor: 'rgba(96, 165, 250, 0.3)', borderTopColor: '#60a5fa' },
  success: { borderColor: 'rgba(52, 211, 153, 0.3)', borderTopColor: '#34d399' },
  warning: { borderColor: 'rgba(251, 191, 36, 0.3)', borderTopColor: '#fbbf24' },
  danger: { borderColor: 'rgba(248, 113, 113, 0.3)', borderTopColor: '#f87171' },
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  return (
    <div
      style={{
        ...sizes[size],
        border: '2px solid',
        borderRadius: '50%',
        borderStyle: 'solid',
        ...colors[color],
        animation: 'samai-spin 1s linear infinite',
      }}
      className={className}
    />
  );
};