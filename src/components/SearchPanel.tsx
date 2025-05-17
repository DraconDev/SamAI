import React from "react";
import { MarkdownRenderer } from "@/utils/markdown";

interface SearchPanelProps {
  response: string | null;
  onClose: () => void;
  onSummarize: () => void;
}

export default function SearchPanel({ response, onClose, onSummarize }: SearchPanelProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '430px',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1b20, #0d0e16)',
        boxShadow: '-5px 0 15px rgba(0,0,0,0.2)',
        padding: '24px',
        overflowY: 'auto',
        zIndex: 9999,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      className="animate-slide-in"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ 
            margin: 0,
            fontSize: '20px',
            fontWeight: 600,
            background: 'linear-gradient(90deg, #818cf8, #4f46e5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            paddingRight: '32px'
          }}>
            Sam AI Results
          </h1>
          <div style={{ height: '2px', width: '40px', background: '#4f46e5', marginTop: '8px' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onSummarize}
            style={{
              padding: '8px 12px',
              background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '14px'
            }}
          >
            Summarize
          </button>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid #4f46e5',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#e2e8f0',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
