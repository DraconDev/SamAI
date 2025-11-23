import { defaultEnv, env } from "@/utils/store";

export default defineBackground(() => {
    // console.log("Hello background!", { id: browser.runtime.id });

    browser.runtime.onInstalled.addListener(async ({ reason }) => {
        if (reason === "install") {
            try {
                const currentEnv = await env.getValue();
                if (!currentEnv) {
                    await env.setValue(defaultEnv);
                    // console.log("Env initialized with default values");
                }
            } catch (error) {
                console.error("Failed to initialize env:", error);
            }
        }
    });
});
