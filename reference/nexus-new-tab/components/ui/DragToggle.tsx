"use client";

interface DragToggleProps {
    onToggle: (isDraggingDisabled: boolean) => void;
    isDraggingDisabled: boolean;
}

export default function DragToggle({
    onToggle,
    isDraggingDisabled,
}: DragToggleProps) {
    const handleToggle = async () => {
        const newValue = !isDraggingDisabled;
        onToggle(newValue);

        try {
            const result = await chrome.storage.sync.get(["settings"]);
            const settings = result.settings || {};

            await chrome.storage.sync.set({
                settings: {
                    ...settings,
                    isDraggingDisabled: newValue,
                },
            });
        } catch (error) {
            console.error("Error saving drag settings:", error);
            // Revert state if save fails
            onToggle(!newValue);
        }
    };

    return (
        <button
            onClick={handleToggle}
            className={`fixed bottom-[92px] right-1 z-[9999] p-2 rounded-full transition-all duration-200 ${
                isDraggingDisabled
                    ? "bg-gray-800/90 hover:bg-gray-700/90"
                    : "bg-green-600/90 hover:bg-green-500/90"
            } backdrop-blur-sm`}
            title={isDraggingDisabled ? "Enable Dragging" : "Disable Dragging"}
        >
            {isDraggingDisabled ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-white"
                >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-white"
                >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </svg>
            )}
        </button>
    );
}
