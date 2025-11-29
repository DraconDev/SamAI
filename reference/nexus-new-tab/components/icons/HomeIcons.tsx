"use client";

import { useState, useEffect } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import IconGrid from "../layout/IconGrid";
import AddLinkModal from "../modals/AddLinkModal";
import DragToggle from "../ui/DragToggle";
import IconSpinner from "../ui/Spinner";

import DonationLink from "../ui/DonationLink";
import Settings from "../ui/Settings";
import { defaultIcons, IconType } from "@/lib/defaultIcons";

type SettingsType = {
    backgroundImage?: string | null;
    iconSize?: string;
    isDraggingDisabled?: boolean;
};

interface HomeIconsProps {
    defaultOnly?: boolean;
    isSharedView?: boolean;
}

const HomeIcons = ({
    defaultOnly = false,
    isSharedView = false,
}: HomeIconsProps) => {
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDraggingDisabled, setIsDraggingDisabled] = useState(false);
    const [iconSize, setIconSize] = useState<string>("normal");
    const [icons, setIcons] = useState<IconType[]>([]);
    const [settings, setSettings] = useState<SettingsType | null>(null);
    const [backupUploaded, setBackupUploaded] = useState(false);

    // Load settings including drag state
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                if (typeof chrome !== "undefined" && chrome.storage) {
                    const result = await chrome.storage.sync.get(["settings"]);
                    const storedSettings =
                        (result.settings as SettingsType) || {};
                    setSettings(storedSettings);
                    setIsDraggingDisabled(
                        storedSettings?.isDraggingDisabled ?? false
                    );
                    setIconSize(storedSettings?.iconSize || "normal");
                } else {
                    // During development or when chrome.storage is not available
                    setSettings({});
                    setIsDraggingDisabled(false);
                    setIconSize("normal");
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                setSettings({});
                setIsDraggingDisabled(false);
                setIconSize("normal");
            }
        };

        if (!isSharedView) {
            fetchSettings();
        }
    }, [isSharedView]);

    // Listen for settings changes
    useEffect(() => {
        const handleSettingsChange = (event: CustomEvent) => {
            const { iconSize: newIconSize } = event.detail;
            if (newIconSize) {
                setIconSize(newIconSize);
            }
        };

        window.addEventListener(
            "settingsChanged",
            handleSettingsChange as EventListener
        );
        return () => {
            window.removeEventListener(
                "settingsChanged",
                handleSettingsChange as EventListener
            );
        };
    }, []);

    // Listen for settings changes from other tabs
    useEffect(() => {
        const handleMessage = (message: any) => {
            if (message.type === "SETTINGS_CHANGED") {
                setSettings(message.settings);
                setIsDraggingDisabled(message.settings.isDraggingDisabled);
                setIconSize(message.settings.iconSize || "normal");
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    // Initialize state for default views immediately
    useEffect(() => {
        if (defaultOnly) {
            setIconSize("normal");
            setIcons(defaultIcons);
            setLoading(false);
            setIsDraggingDisabled(false);
        }
    }, [defaultOnly]);

    // Load icons
    useEffect(() => {
        if (defaultOnly) return;

        const loadIcons = async () => {
            try {
                if (typeof chrome !== "undefined" && chrome.storage) {
                    const result = await chrome.storage.sync.get(["icons"]);
                    const storedIcons =
                        (result.icons as IconType[]) || defaultIcons;
                    setIcons(storedIcons);
                } else {
                    // During development or when chrome.storage is not available
                    setIcons(defaultIcons);
                }
            } catch (error) {
                console.error("Error loading icons:", error);
                setIcons(defaultIcons);
            }
            setLoading(false);
        };

        loadIcons();
    }, [defaultOnly, backupUploaded]);

    // Listen for backup uploaded event
    useEffect(() => {
        const handleBackupUploaded = () => {
            setBackupUploaded((prev) => !prev);
        };

        window.addEventListener("backupUploaded", handleBackupUploaded);

        return () => {
            window.removeEventListener("backupUploaded", handleBackupUploaded);
        };
    }, []);

    const handleAddLink = async (
        name: string,
        link: string,
        imageUrl: string
    ) => {
        const newIcon: IconType = {
            id: Date.now(),
            name,
            link,
            imageUrl,
            order: icons.length,
        };

        const updatedIcons = [...icons, newIcon];

        try {
            await chrome.storage.sync.set({ icons: updatedIcons });
            setIcons(updatedIcons);
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Failed to add icon:", error);
        }
    };

    const handleDeleteIcon = async (id: number) => {
        const updatedIcons = icons.filter((icon) => icon.id !== id);

        try {
            await chrome.storage.sync.set({ icons: updatedIcons });
            setIcons(updatedIcons);
        } catch (error) {
            console.error("Failed to delete icon:", error);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        if (isDraggingDisabled) return;

        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = icons.findIndex((icon) => icon.id === active.id);
            const newIndex = icons.findIndex((icon) => icon.id === over.id);

            const newIcons = arrayMove(icons, oldIndex, newIndex);

            try {
                await chrome.storage.sync.set({ icons: newIcons });
                setIcons(newIcons);

                // Dispatch the "iconsChanged" event
                window.dispatchEvent(
                    new CustomEvent("iconsChanged", {
                        detail: { icons: newIcons },
                    })
                );
            } catch (error) {
                console.error("Failed to update icon order:", error);
            }
        }
    };

    const updateSettings = async (newSettings: SettingsType) => {
        try {
            await chrome.storage.sync.set({ settings: newSettings });
            chrome.runtime.sendMessage({
                type: "UPDATE_SETTINGS",
                settings: newSettings,
            });
        } catch (error) {
            console.error("Failed to update settings:", error);
        }
    };

    const handleDragToggle = (newValue: boolean) => {
        setIsDraggingDisabled(newValue);
        if (settings) {
            const newSettings = {
                ...settings,
                isDraggingDisabled: newValue,
            };
            updateSettings(newSettings);
        }
    };

    return (
        <div className="relative">
            {defaultOnly && (
                <div className="max-w-lg px-6 py-3 mx-auto mb-6 text-center rounded-lg backdrop-blur-sm text-white/80 bg-black/40">
                    <p>
                        Make this your homepage and access your favorite links
                        with style ✨
                    </p>
                </div>
            )}
            {/* {!isSharedView && (
                <div className="flex items-center justify-between px-4 py-2">
                    <DragToggle
                        isDraggingDisabled={isDraggingDisabled}
                        onToggle={handleDragToggle}
                    />
                </div>
            )} */}
            <DragToggle
                isDraggingDisabled={isDraggingDisabled}
                onToggle={handleDragToggle}
            />
            <Settings />
            <DonationLink />
            <div className="fixed flex gap-2 right-4 bottom-4"></div>
            {loading ? (
                <div className="flex justify-center">
                    <IconSpinner />
                </div>
            ) : (
                <IconGrid
                    icons={icons}
                    iconSize={iconSize}
                    isSharedView={isSharedView}
                    isDraggingDisabled={isDraggingDisabled}
                    onDragEnd={handleDragEnd}
                    onDelete={handleDeleteIcon}
                    onAddClick={() => setIsAddModalOpen(true)}
                />
            )}
            <AddLinkModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddLink}
            />
        </div>
    );
};

export default HomeIcons;
