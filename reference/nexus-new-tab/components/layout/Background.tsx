"use client";

import { DEFAULT_BACKGROUND } from "@/lib/constants";
import { useEffect, useState } from "react";

type SettingsType = {
    backgroundImage?: string;
};

export default function Background({ imageUrl }: { imageUrl?: string }) {
    const [background, setBackground] = useState<string>(
        imageUrl || DEFAULT_BACKGROUND
    );
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const fetchBackground = async () => {
            try {
                const result = await chrome.storage.sync.get(["settings"]);
                const settings = result.settings as SettingsType;
                console.log("Fetched settings:", settings);
                if (settings?.backgroundImage) {
                    console.log("Setting background to:", settings.backgroundImage);
                    setBackground(settings.backgroundImage);
                } else {
                    // If no custom background, use default
                    setBackground(DEFAULT_BACKGROUND);
                }
            } catch (error) {
                console.error("Failed to load background:", error);
                setBackground(DEFAULT_BACKGROUND);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBackground();

        // Listen for settings changes
        const handleSettingsChange = (event: CustomEvent) => {
            const { backgroundImage } = event.detail;
            console.log("Settings changed, new background:", backgroundImage);
            if (backgroundImage) {
                setBackground(backgroundImage);
            } else {
                setBackground(DEFAULT_BACKGROUND);
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

    const handleImageError = () => {
        console.error("Failed to load image:", background);
        setHasError(true);
        if (background !== DEFAULT_BACKGROUND) {
            // Only fallback to default if we're not already using it
            setBackground(DEFAULT_BACKGROUND);
        }
    };

    return (
        <div className="fixed inset-0 -z-10">
            {/* Show loading state */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white">Loading background...</div>
                </div>
            )}

            {/* Show error state */}
            {hasError && background === DEFAULT_BACKGROUND && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white">Failed to load background</div>
                </div>
            )}

            {/* Background image */}
            <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                    backgroundImage: `url(${background})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: isLoading || hasError ? 0 : 1,
                }}
            >
                {/* Hidden image to detect load errors */}
                <img
                    src={background}
                    alt=""
                    className="hidden"
                    onError={handleImageError}
                    onLoad={() => {
                        setIsLoading(false);
                        setHasError(false);
                    }}
                />
            </div>

            {/* Fallback color */}
            <div className="absolute inset-0 bg-black -z-20" />
        </div>
    );
}
