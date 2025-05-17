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
