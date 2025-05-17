import React from "react";
import { MarkdownRenderer } from "@/utils/markdown";

interface SearchPanelProps {
  response: string | null;
  onClose: () => void;
  onSummarize: () => void;
}

export default function SearchPanel({ response, onClose, onSummarize }: SearchPanelProps) {
  return (
    <div className="search-panel">
      <div className="panel-header">
        <h1>Sam AI Results</h1>
        <div className="header-divider" />
      </div>
      
      <div className="panel-controls">
        <button className="summary-button" onClick={onSummarize}>
          Summarize
        </button>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="panel-content">
        {response ? (
          <MarkdownRenderer content={response} />
        ) : (
          <div className="loading-indicator">
            <div className="spinner" />
            <p>Generating insight...</p>
          </div>
        )}
      </div>
    </div>
  );
}
