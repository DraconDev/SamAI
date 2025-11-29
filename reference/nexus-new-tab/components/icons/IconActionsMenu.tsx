"use client";

import { createPortal } from 'react-dom';

interface IconActionsMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete?: () => void;
}

export default function IconActionsMenu({
    isOpen,
    onClose,
    onEdit,
    onDelete
}: IconActionsMenuProps) {
    if (!isOpen) return null;

    return createPortal(
        <>
            <div 
                className="fixed inset-0 bg-black/50 z-[99999]"
                onClick={onClose}
            />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800/90 backdrop-blur-md rounded-xl shadow-2xl p-6 z-[100000] w-[90%] max-w-md">
                <div className="space-y-2">
                    <button
                        onClick={onEdit}
                        className="flex gap-3 items-center px-4 py-3 w-full text-sm font-medium text-gray-300 rounded-lg transition-all duration-200 bg-gray-700/90 hover:bg-gray-600 hover:scale-102 sm:text-base"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                    </button>
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="flex gap-3 items-center px-4 py-3 w-full text-sm font-medium text-red-400 rounded-lg transition-all duration-200 bg-gray-700/90 hover:bg-gray-600 hover:scale-102 group sm:text-base"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-colors group-hover:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
}
