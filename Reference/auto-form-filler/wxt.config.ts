import { defineConfig } from "wxt";
// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  manifest: {
    name: "AI-Powered Form Automator",
    description:
      "Intelligently fill web forms using AI. Customize your experience by adding your own settings and prompts.",
    version: "1.7.145",
    host_permissions: ["<all_urls>"],
    permissions: ["storage"],
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
      default_title: "",
    },
    background: {
      service_worker: "background.ts",
      type: "module",
    },
  },
  modules: ["@wxt-dev/module-react"],
});
