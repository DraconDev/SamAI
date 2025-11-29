"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

interface EditIconModalProps {
    id: number;
    initialName: string;
    initialLink: string;
    initialImageUrl: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, link: string, imageUrl: string) => void;
}

export default function EditIconModal({
    initialName,
    initialLink,
    initialImageUrl,
    isOpen,
    onClose,
    onSave,
}: EditIconModalProps) {
    const [name, setName] = useState(initialName);
    const [link, setLink] = useState(initialLink);
    const [imageUrl, setImageUrl] = useState(initialImageUrl);

    if (!isOpen) return null;

    return createPortal(
        <>
            <div
                className="fixed inset-0 bg-black/50 z-[99999]"
                onClick={onClose}
            />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800/90 backdrop-blur-md rounded-xl shadow-2xl p-6 z-[100000] w-[90%] max-w-md">
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        onSave(name, link, imageUrl);
                    }}
                >
                    <div className="space-y-4 sm:space-y-6">
                        <h3 className="mb-4 text-lg font-medium text-white sm:mb-6">
                            Edit Icon
                        </h3>
                        <div>
                            <label
                                htmlFor="name"
                                className="block mb-2 text-base font-medium text-gray-300"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block p-2 mt-1 w-full text-sm text-white rounded-md border-transparent bg-gray-700/90 focus:border-gray-500 focus:bg-gray-600 focus:ring-0 sm:p-3 sm:text-base"
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="link"
                                className="block mb-2 text-base font-medium text-gray-300"
                            >
                                Link
                            </label>
                            <input
                                type="url"
                                id="link"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="block p-2 mt-1 w-full text-sm text-white rounded-md border-transparent bg-gray-700/90 focus:border-gray-500 focus:bg-gray-600 focus:ring-0 sm:p-3 sm:text-base"
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="imageUrl"
                                className="block mb-2 text-base font-medium text-gray-300"
                            >
                                Image URL (optional)
                            </label>
                            <input
                                type="url"
                                id="imageUrl"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="block p-2 mt-1 w-full text-sm text-white rounded-md border-transparent bg-gray-700/90 focus:border-gray-500 focus:bg-gray-600 focus:ring-0 sm:p-3 sm:text-base"
                                placeholder="https://"
                            />
                        </div>
                        <div className="flex justify-end pt-6 mt-6 space-x-3 border-t border-gray-400/20">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-300 rounded-lg transition-all duration-200 sm:text-base bg-gray-700/90 hover:bg-gray-600 hover:scale-102 grow"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 w-1/2 text-sm font-medium text-white bg-blue-500 rounded-lg shadow-lg transition-all duration-200 sm:text-base hover:bg-blue-600 hover:scale-102"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>,
        document.body
    );
}
