import React from 'react';
import { MarkdownRenderer } from '@/utils/markdown';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

interface SummaryTabProps {
  isSummarizing: boolean;
  summary: string;
  summaryError: string;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  isSummarizing,
  summary,
  summaryError,
}) => {
  return (
    <div style={{ 
      padding: "1rem", 
      height: '100%', 
      overflowY: 'auto' 
    }}>
      {isSummarizing ? (
        <div style={{ 
          textAlign: "center",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 10px 30px -10px rgba(245, 158, 11, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
        }}>
          <LoadingSpinner size="lg" color="warning" />
          <p style={{ 
            color: "#fbbf24", 
            fontSize: "16px", 
            fontWeight: 600, 
            marginTop: "1.5rem",
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Summarizing page content...
          </p>
          <p style={{
            marginTop: "0.75rem",
            color: "#94a3b8",
            fontSize: "13px",
            fontWeight: 400,
          }}>
            Analyzing and extracting key information
          </p>
        </div>
      ) : summaryError ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '1rem',
          padding: '1.5rem',
          color: "#ef4444",
          fontSize: "14px",
          boxShadow: '0 10px 30px -10px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <strong style={{ fontSize: '16px' }}>Error:</strong>
          </div>
          <p style={{ color: '#fca5a5', lineHeight: '1.6' }}>{summaryError}</p>
        </div>
      ) : summary ? (
        <div 
          className="prose markdown-content prose-invert max-w-none"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 10px 30px -10px rgba(245, 158, 11, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            color: '#f1f5f9',
            lineHeight: '1.75',
          }}
        >
          <div style={{
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              margin: 0,
              background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              📄 Page Summary
            </h2>
          </div>
          <MarkdownRenderer content={summary} />
        </div>
      ) : (
        <div style={{ 
          color: "#94a3b8", 
          fontSize: "14px", 
          textAlign: "center",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 10px 30px -10px rgba(245, 158, 11, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "1.25rem",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.15))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            boxShadow: '0 8px 20px -4px rgba(245, 158, 11, 0.3)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
              <line x1="21" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="3" y2="18" />
            </svg>
          </div>
          <p style={{ fontSize: '15px', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
            Ready to Summarize
          </p>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>
            Click the "Sum" tab to generate a summary of this page
          </p>
        </div>
      )}
    </div>
  );
};