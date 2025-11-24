import React from 'react';

interface FormTabProps {
  onFormClick: () => void;
}

export const FormTab: React.FC<FormTabProps> = ({ onFormClick }) => {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-[#1E1F2E]/80 rounded-xl border border-[#2E2F3E]/60">
        <h3 className="text-lg font-bold mb-3 text-transparent bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] bg-clip-text">
          Smart Form Filler
        </h3>
        <p className="mb-4 text-sm text-gray-400">
          AI-powered form filling feature coming soon!
        </p>
        <div className="py-8 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-[#8b5cf6]/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
            />
          </svg>
          <p className="text-sm text-gray-500">Feature in development</p>
        </div>
      </div>
    </div>
  );
};