import { defineConfig } from "wxt";
// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "webextension-polyfill", // Corrected from "webextension" to "webextension-polyfill"
  manifest: {
    name: "Search Ace: Hide & Highlight Results",
    description:
      "Declutter search, hide distractions, highlight what matters. Find what you need, faster. Syncs across devices!",
    version: "0.0.224",
    permissions: ["storage"],
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "96": "icon/96.png",
      "128": "icon/128.png",
    },
    browser_specific_settings: {
      gecko: {
        id: "random_id",
      },
    },
  },
  modules: ["@wxt-dev/module-react"],
});
