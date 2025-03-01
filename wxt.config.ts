import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  manifest: {
    name: "SamAI - Smart AI Assistant",
    description: "Your intelligent AI companion powered by Google Gemini. Enhances web search, chat with context, and helps with writing & research. Privacy focused.",
    manifest_version: 3,
    version: "1.1.168",
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
      default_title: "SamAI - Smart AI Assistant",
    },
    author: "Sam AI Team",
    homepage_url: "https://samai.dev",
  },
  modules: ["@wxt-dev/module-react"],
});
