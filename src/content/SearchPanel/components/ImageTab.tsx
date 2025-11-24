import React from 'react';

interface ImageTabProps {
  onImageClick: () => void;
}

export const ImageTab: React.FC<ImageTabProps> = ({ onImageClick }) => {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-[#1E1F2E]/80 rounded-xl border border-[#2E2F3E]/60">
        <h3 className="text-lg font-bold mb-3 text-transparent bg-gradient-to-r from-[#f472b6] to-[#ec4899] bg-clip-text">
          Image Generation
        </h3>
        <p className="mb-4 text-sm text-gray-400">
          Quick access to image generation tools.
        </p>
        <div className="py-8 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-[#ec4899]/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="text-sm text-gray-500">Feature in development</p>
        </div>
      </div>
    </div>
  );
};