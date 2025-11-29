"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect, useRef } from "react";
import EditIconModal from "../modals/EditIconModal";
import IconActionsMenu from "../icons/IconActionsMenu";
import { IconType } from "@/lib/defaultIcons";

interface Props {
    id: number;
    name: string;
    link: string;
    imageUrl?: string;
    onDelete?: (id: number) => void;
    isDraggingDisabled?: boolean;
    isSharedView?: boolean;
    backgroundImage?: string;
    initialIcons?: IconType[];
    iconSize: string;
}

const HomeBox = (props: Props) => {
    const domain = props.link.match(/(?<=\/\/)[^\/]+(?=\/?)/)?.[0] || "";
    const [name, setName] = useState(props.name);
    const [link, setLink] = useState(props.link);
    const [imageUrl, setImageUrl] = useState(props.imageUrl || "");
    const getIconUrl = (domain: string) => {
        if (imageUrl) {
            return [imageUrl];
        }

        return [
            `https://icon.horse/icon/${domain}`,
            `https://www.google.com/s2/favicons?sz=128&domain=${domain}`,
            `/api/icon?domain=${domain}`,
        ];
    };

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props.id,
        disabled: props.isDraggingDisabled,
    });

    const [showActions, setShowActions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showSpinner, setShowSpinner] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const mousePosition = useRef({ x: 0, y: 0 });
    const dragThreshold = 5; // Threshold for mouse movement to trigger a drag

    useEffect(() => {
        const timer = setTimeout(() => {
            if (showSpinner) {
                setShowSpinner(false);
                setLoadError(true);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [showSpinner]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!props.isDraggingDisabled) {
            mousePosition.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!props.isDraggingDisabled) {
            const movedX = Math.abs(e.clientX - mousePosition.current.x);
            const movedY = Math.abs(e.clientY - mousePosition.current.y);

            if (movedX <= dragThreshold && movedY <= dragThreshold) {
                window.open(link, "_blank", "noopener,noreferrer");
                console.log("handleMouseUp - Opening link");
            }
        } else {
            window.open(link, "_blank", "noopener,noreferrer");
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!props.isDraggingDisabled) {
            setShowActions(true);
        }
    };

    const updateBoxProps = (name: string, link: string, imageUrl: string) => {
        setName(name);
        setLink(link);
        setImageUrl(imageUrl);
    };

    const handleSave = async (name: string, link: string, imageUrl: string) => {
        try {
            const result = await chrome.storage.sync.get(["icons"]);
            const icons = (result.icons as IconType[]) || [];

            const updatedIcons = icons.map((icon) =>
                icon.id === props.id ? { ...icon, name, link, imageUrl } : icon
            );

            await chrome.storage.sync.set({ icons: updatedIcons });

            updateBoxProps(name, link, imageUrl);

            // Dispatch event to notify other components
            window.dispatchEvent(
                new CustomEvent("iconsChanged", {
                    detail: { icons: updatedIcons },
                })
            );

            setShowActions(false);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update icon:", error);
        }
    };

    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition,
        zIndex: isDragging ? 1000 : showActions ? 50 : 1,
        opacity: isDragging ? 0.8 : 1,
        cursor: props.isDraggingDisabled
            ? "pointer"
            : isDragging
            ? "grabbing"
            : "grab",
        touchAction: props.isDraggingDisabled ? "auto" : "none",
        userSelect: "none" as const,
    } satisfies React.CSSProperties;

    const iconPaths = getIconUrl(domain);
    const image_link = iconPaths[0];

    // Add event listener for iconsChanged
    useEffect(() => {
        const handleIconsChanged = (
            event: CustomEvent<{ icons: IconType[] }>
        ) => {
            // Update the icons state with the new icons
            // This component doesn't directly manage the icon list, so it doesn't need to update its own state
            // Instead, it relies on the parent component to pass down the updated icons
            console.log("iconsChanged event received", event.detail.icons);
        };

        window.addEventListener(
            "iconsChanged",
            handleIconsChanged as EventListener
        );

        return () => {
            window.removeEventListener(
                "iconsChanged",
                handleIconsChanged as EventListener
            );
        };
    }, []);

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...(props.isDraggingDisabled ? {} : listeners)}
                onContextMenu={handleContextMenu}
                onMouseUp={handleMouseUp}
                onMouseDown={handleMouseDown}
                className={`relative p-1 hover:z-10`}
            >
                <div className="flex flex-col items-center gap-1 cursor-pointer">
                    <div
                        className={`overflow-hidden relative shadow-sm transition-all duration-200 outline-black bg-black/60 outline outline-2 hover:outline-green-500 ${getIconSizeClasses(
                            props.iconSize
                        )}`}
                    >
                        <img
                            src={loadError ? "/placeholder.png" : image_link}
                            alt={name}
                            className="object-contain w-full h-full"
                            onLoad={() => {
                                setShowSpinner(false);
                                setLoadError(false);
                            }}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const currentIndex = iconPaths.indexOf(
                                    target.src
                                );
                                if (currentIndex < iconPaths.length - 1) {
                                    target.src = iconPaths[currentIndex + 1];
                                } else {
                                    setLoadError(true);
                                }
                                setShowSpinner(false);
                            }}
                        />
                        {showSpinner && <IconSpinner />}
                    </div>
                    <div className="mt-1 rounded-sm bg-black/60">
                        <span
                            className={`block font-semibold text-white capitalize truncate ${getTextSizeClasses(
                                props.iconSize
                            )}`}
                        >
                            {name}
                        </span>
                    </div>
                </div>
            </div>

            <IconActionsMenu
                isOpen={showActions && !isEditing}
                onClose={() => setShowActions(false)}
                onEdit={() => setIsEditing(true)}
                onDelete={
                    props.onDelete
                        ? () => {
                              setShowActions(false);
                              props.onDelete?.(props.id);
                          }
                        : undefined
                }
            />

            <EditIconModal
                id={props.id}
                initialName={name}
                initialLink={link}
                initialImageUrl={imageUrl || ""}
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                onSave={handleSave}
            />
        </>
    );
};

function IconSpinner() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-white/80"></div>
        </div>
    );
}

function getIconSizeClasses(size: string) {
    switch (size) {
        case "big":
            return "w-[105px] h-[105px] md:w-[250px] md:h-[250px] rounded-[35px] md:rounded-[70px]";
        case "huge":
            return "w-[140px] h-[140px] md:w-[300px] md:h-[300px] rounded-[40px] md:rounded-[85px]";
        default: // normal
            return "w-[70px] h-[70px] md:w-[200px] md:h-[200px] rounded-[30px] md:rounded-[50px]";
    }
}

function getTextSizeClasses(size: string) {
    switch (size) {
        case "big":
            return "text-sm md:text-lg";
        case "huge":
            return "text-base md:text-xl";
        default: // normal
            return "text-xs md:text-base";
    }
}

export default HomeBox;
