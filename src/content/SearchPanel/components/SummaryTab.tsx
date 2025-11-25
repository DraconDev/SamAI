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
    <div style={{ padding: "24px", height: '100%', overflowY: 'auto' }}>
      {isSummarizing ? (
        <div style={{ textAlign: "center" }}>
          <LoadingSpinner size="lg" color="warning" />
          <p style={{ color: "#fbbf24", fontSize: "16px", fontWeight: 600, marginTop: "16px" }}>
            Summarizing page content...
          </p>
        </div>
      ) : summaryError ? (
        <div style={{ color: "#ef4444", fontSize: "14px" }}>
          <strong>Error:</strong> {summaryError}
        </div>
      ) : summary ? (
        <div className="prose markdown-content prose-invert max-w-none">
          <MarkdownRenderer content={summary} />
        </div>
      ) : (
        <div style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center" }}>
          Click the "Sum" tab to summarize this page.
        </div>
      )}
    </div>
  );
};