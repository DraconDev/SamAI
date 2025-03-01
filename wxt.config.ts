import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  manifest: {
    name: "SamAI - Smart AI Assistant (Free)",
    description: "✨ Free AI assistant that enhances search results, provides insights, and helps with writing. 🔒 Private, fast, and seamlessly integrated. No subscriptions!",
    manifest_version: 3,
    version: "1.2.4",
    permissions: ["storage", "contextMenus", "activeTab", "tabs", "scripting"],
    host_permissions: ["<all_urls>"],
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "96": "icon/96.png",
      "128": "icon/128.png",
    },
    action: {
      default_popup: "popup.html",
      default_icon: {
        "16": "icon/16.png",
        "32": "icon/32.png",
        "48": "icon/48.png",
        "128": "icon/128.png",
      },
      default_title: "SamAI - Smart AI Assistant (Free)",
    }
  },
  modules: ["@wxt-dev/module-react"],
});
