"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type SettingsType = {
    backgroundImage?: string;
    iconSize?: string;
};

export default function Settings() {
    const [isOpen, setIsOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [iconSize, setIconSize] = useState("normal");
    const [saving, setSaving] = useState(false);
    const [icons, setIcons] = useState([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const result = await chrome.storage.sync.get([
                    "settings",
                    "icons",
                ]);
                const settings = result.settings as SettingsType;
                if (settings?.backgroundImage) {
                    setImageUrl(settings.backgroundImage);
                }
                if (settings?.iconSize) {
                    setIconSize(settings.iconSize);
                }
                if (result.icons) {
                    setIcons(result.icons);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const handleUrlSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (saving) return;

        if (imageUrl.length == 0) {
            handleIconSizeChange();
            return;
        }

        try {
            setSaving(true);

            // Validate URL
            let validImageUrl = imageUrl;

            // Test if image loads
            const img = new Image();
            img.onerror = () => {
                console.error("Failed to load image:", validImageUrl);
                alert(
                    "Failed to load image. Please check the URL and try again."
                );
                setSaving(false);
            };
            img.onload = async () => {
                const settings: SettingsType = {
                    backgroundImage: validImageUrl,
                    iconSize: iconSize,
                };

                await chrome.storage.sync.set({ settings });

                // Dispatch a custom event to notify other components
                window.dispatchEvent(
                    new CustomEvent("settingsChanged", {
                        detail: { backgroundImage: validImageUrl, iconSize },
                    })
                );

                setIsOpen(false);
                setSaving(false);
            };
            img.src = validImageUrl;
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings. Please try again.");
            setSaving(false);
        }
    };

    const handleIconSizeChange = async () => {
        const settings: SettingsType = {
            iconSize: iconSize,
        };

        await chrome.storage.sync.set({ settings });

        // Dispatch a custom event to notify other components
        window.dispatchEvent(
            new CustomEvent("settingsChanged", {
                detail: { iconSize },
            })
        );
        setIsOpen(false);
    };

    const handleDownloadBackup = async () => {
        try {
            const result = await chrome.storage.sync.get(["icons", "settings"]);
            const syncedIcons = result.icons || [];
            const settings = result.settings as SettingsType;
            const backupData = {
                icons: syncedIcons,
                backgroundImage: settings?.backgroundImage,
                iconSize: settings.iconSize,
            };
            const json = JSON.stringify(backupData, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "dracon-new-tab-settings.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading backup:", error);
            alert("Failed to download backup. Please try again.");
        }
    };

    const handleUploadBackup = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = event.target?.result as string;
                const backupData = JSON.parse(json);
                if (backupData && Array.isArray(backupData.icons)) {
                    await chrome.storage.sync.set({ icons: backupData.icons });

                    const settings: SettingsType = {
                        backgroundImage: backupData.backgroundImage
                            ? backupData.backgroundImage
                            : "",
                        iconSize: iconSize,
                    };
                    await chrome.storage.sync.set({ settings });
                    window.dispatchEvent(
                        new CustomEvent("settingsChanged", {
                            detail: {
                                backgroundImage: backupData.backgroundImage,
                                iconSize,
                            },
                        })
                    );
                    setImageUrl(backupData.backgroundImage);

                    setIcons(backupData.icons);
                    window.dispatchEvent(
                        new CustomEvent("iconsChanged", {
                            detail: { icons: backupData.icons },
                        })
                    );
                    window.dispatchEvent(new CustomEvent("backupUploaded"));
                    alert("Backup uploaded successfully!");
                } else {
                    alert("Invalid backup file. Please try again.");
                }
            } catch (error) {
                console.error("Error uploading backup:", error);
                alert("Failed to upload backup. Please try again.");
            }
        };

        reader.readAsText(file);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-white rounded-full backdrop-blur-sm transition-colors bg-gray-800/90 hover:bg-gray-700/90 fixed bottom-12 right-1 z-[9999]"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            </button>
            {isOpen &&
                createPortal(
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm"
                        onClick={(e) =>
                            e.target === e.currentTarget && setIsOpen(false)
                        }
                    >
                        <div className="w-full max-w-md p-6 border shadow-2xl rounded-xl bg-gray-800/90 border-white/20">
                            <h3 className="mb-4 text-lg font-medium text-white sm:mb-6">
                                Background Settings
                            </h3>
                            <form onSubmit={handleUrlSubmit}>
                                <div className="space-y-4 sm:space-y-6">
                                    <div>
                                        <label
                                            htmlFor="imageUrl"
                                            className="block mb-2 text-base font-medium text-gray-300"
                                        >
                                            Background Image URL
                                        </label>
                                        <input
                                            type="text"
                                            id="imageUrl"
                                            value={
                                                imageUrl.startsWith("/")
                                                    ? ""
                                                    : imageUrl
                                            }
                                            onChange={(e) =>
                                                setImageUrl(e.target.value)
                                            }
                                            placeholder="Enter image URL or leave empty for default"
                                            className="block w-full p-2 mt-1 text-sm text-white border-transparent rounded-md bg-gray-700/90 focus:border-gray-500 focus:bg-gray-600 focus:ring-0 sm:p-3 sm:text-base"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-base font-medium text-gray-300">
                                            Icon Size
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIconSize("normal")
                                                }
                                                className={`px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                                                    iconSize === "normal"
                                                        ? "bg-blue-500 text-white shadow-lg scale-105"
                                                        : "bg-gray-700/90 text-gray-300 hover:bg-gray-600 hover:scale-102"
                                                }`}
                                            >
                                                Normal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIconSize("big")
                                                }
                                                className={`px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                                                    iconSize === "big"
                                                        ? "bg-blue-500 text-white shadow-lg scale-105"
                                                        : "bg-gray-700/90 text-gray-300 hover:bg-gray-600 hover:scale-102"
                                                }`}
                                            >
                                                Big
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIconSize("huge")
                                                }
                                                className={`px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                                                    iconSize === "huge"
                                                        ? "bg-blue-500 text-white shadow-lg scale-105"
                                                        : "bg-gray-700/90 text-gray-300 hover:bg-gray-600 hover:scale-102"
                                                }`}
                                            >
                                                Huge
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-600 rounded-lg sm:px-6 sm:py-3 hover:bg-gray-700 sm:text-base"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-500 rounded-lg sm:px-6 sm:py-3 hover:bg-blue-600 disabled:opacity-50 sm:text-base"
                                        >
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <div className="flex flex-col gap-2 mt-4">
                                <button
                                    onClick={handleDownloadBackup}
                                    className="w-full px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 sm:text-base"
                                >
                                    Download Backup
                                </button>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleUploadBackup}
                                    className="hidden"
                                    ref={fileInputRef}
                                    id="upload-backup"
                                />
                                <label
                                    htmlFor="upload-backup"
                                    className="w-full px-4 py-2 text-sm font-medium text-center text-white transition-colors bg-blue-500 rounded-lg cursor-pointer hover:bg-blue-600 sm:text-base"
                                >
                                    Upload Backup
                                </label>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
