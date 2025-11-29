import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "webextension-polyfill",
  manifest: {
    name: "SamAI - Smart AI Assistant",
    description:
      "✨ Free AI assistant that enhances search results, provides insights, and helps with writing. ",
    version: "1.4.243",
    permissions: ["storage", "contextMenus", "activeTab", "tabs", "scripting"],
    host_permissions: ["<all_urls>"],
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "96": "icon/96.png",
      "128": "icon/128.png",
    },
    browser_specific_settings: {
      gecko: {
        id: "dracsharp@gmail.com",
      },
    },
  },
  modules: ["@wxt-dev/module-react"],
  runner: {
    startUrls: ["https://www.google.com/search?q=test"],
  },
});
