import { defaultStore, store } from "@/utils/store";

export default defineBackground(() => {
    console.log("Hello background!", { id: browser.runtime.id });

    browser.runtime.onInstalled.addListener(async ({ reason }) => {
        if (reason === "install") {
            try {
                const currentStore = await store.getValue();
                if (!currentStore) {
                    await store.setValue(defaultStore);
                    console.log("Store initialized with default values");
                }
            } catch (error) {
                console.error("Failed to initialize store:", error);
            }
        }
    });
});
