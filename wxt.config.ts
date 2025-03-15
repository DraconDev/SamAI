import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "webextension-polyfill",
  manifest: {
    name: "SamAI - Smart AI Assistant",
    description:
      "✨ Free AI assistant that enhances search results, provides insights, and helps with writing. ",
    manifest_version: 3,
    version: "1.2.9",
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
  },
  modules: ["@wxt-dev/module-react"],
  // Add Firefox-specific configuration
  browser: {
    firefox: {
      manifest: {
        // Use manifest_version 2 for Firefox
        manifest_version: 2,
        // Convert action to browser_action (for MV2)
        browser_action: {
          default_popup: "popup.html",
          default_icon: {
            "16": "icon/16.png",
            "32": "icon/32.png",
            "48": "icon/48.png",
            "128": "icon/128.png",
          },
          default_title: "SamAI - Smart AI Assistant",
        },
        // Move host_permissions to permissions for MV2
        permissions: [
          "storage", 
          "contextMenus", 
          "activeTab", 
          "tabs", 
          "scripting",
          "<all_urls>"
        ],
        // Remove MV3-specific keys
        action: undefined,
        host_permissions: undefined,
      }
    }
  }
});
