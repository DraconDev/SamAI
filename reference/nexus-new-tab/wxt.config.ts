import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "webextension-polyfill",
  manifest: {
    name: "Dracon New Tab",
    version: "0.0.4",
    description: "A customizable new tab page with your favorite links",
    permissions: ["storage", "tabs"],
    chrome_url_overrides: {
      newtab: "entrypoints/newtab/index.html",
    },
    background: {
      service_worker: "entrypoints/background.js",
      type: "module",
    },
    action: {
      default_icon: {
        16: "icon/16.png",
        32: "icon/32.png",
        48: "icon/48.png",
        96: "icon/96.png",
        128: "icon/128.png",
      },
    },
    icons: {
      16: "icon/16.png",
      32: "icon/32.png",
      48: "icon/48.png",
      96: "icon/96.png",
      128: "icon/128.png",
    },
  },
  modules: ["@wxt-dev/module-react"],
});
