"use client";

import { Plus } from "lucide-react";

interface AddIconProps {
    onClick: () => void;
    iconSize: string;
}

const AddIcon = ({ onClick, iconSize }: AddIconProps) => {
    const getIconSizeClasses = () => {
        switch (iconSize) {
            case "big":
                return "w-[105px] h-[105px] md:w-[250px] md:h-[250px] rounded-[35px] md:rounded-[70px]";
            case "huge":
                return "w-[140px] h-[140px] md:w-[300px] md:h-[300px] rounded-[40px] md:rounded-[85px]";
            default: // normal
                return "w-[70px] h-[70px] md:w-[200px] md:h-[200px] rounded-[30px] md:rounded-[50px]";
        }
    };

    const getPlusIconSizeClasses = () => {
        switch (iconSize) {
            case "big":
                return "w-12 h-12 md:w-24 md:h-24";
            case "huge":
                return "w-16 h-16 md:w-32 md:h-32";
            default:
                return "w-8 h-8 md:w-20 md:h-20";
        }
    };

    const getTextSizeClasses = () => {
        switch (iconSize) {
            case "big":
                return "text-lg md:text-3xl max-w-[105px] md:max-w-[250px]";
            case "huge":
                return "text-xl md:text-4xl max-w-[140px] md:max-w-[300px]";
            default: // normal
                return "text-base md:text-2xl max-w-[70px] md:max-w-[200px]";
        }
    };

    return (
        <div className="p-1">
            <div className="flex flex-col items-center gap-1">
                <div
                    onClick={onClick}
                    className={`${getIconSizeClasses()} flex items-center justify-center relative bg-black/60 shadow-sm overflow-hidden outline outline-2 outline-black hover:outline-green-500 cursor-pointer`}
                >
                    <Plus
                        className={`${getPlusIconSizeClasses()} text-green-500`}
                        strokeWidth={2}
                    />
                </div>
            </div>
        </div>
    );
};

export default AddIcon;
