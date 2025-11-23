import React, { useState, useEffect } from "react";
import { env as envStore, descriptionEnabled } from "@/utils/store";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";

type Props = {};

function goToDescription() {
    chrome.tabs.create({
        url: chrome.runtime.getURL("description.html"),
    });
}

const Description = (props: Props) => {
    const [useUserInfo, setUseUserInfo] = useState(false);

    useEffect(() => {
        (async () => {
            const enabled = await descriptionEnabled.getValue();
            setUseUserInfo(enabled);
        })();
    }, []);

    const handleToggle = async (checked: boolean) => {
        await descriptionEnabled.setValue(checked);
        setUseUserInfo(checked);
    };

    return (
        <div className="flex flex-col space-y-4 p-4 rounded-lg bg-white border border-gray-200">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Use Personal Info</span>
                <Switch checked={useUserInfo} onCheckedChange={handleToggle} />
            </div>
            <Button
                variant="outline"
                onClick={goToDescription}
                className="w-full justify-between"
            >
                <span>Edit Personal Info</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </Button>
            <p className="text-xs text-gray-500 text-center">
                {useUserInfo
                    ? "Using personal information for form filling"
                    : "Using default form filling"}
            </p>
        </div>
    );
};

export default Description;
