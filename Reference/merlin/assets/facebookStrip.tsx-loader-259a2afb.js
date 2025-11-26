(function () {
  const chrome = window.chrome || {};
  chrome.runtime = chrome.runtime || {};
  chrome.runtime.getURL = chrome.runtime.getURL || function(path) { return path.replace("assets/", "./"); };
})();

(function () {
  'use strict';

  const injectTime = performance.now();
  (async () => {
    const { onExecute } = await import(
      /* @vite-ignore */
      chrome.runtime.getURL("assets/facebookStrip.tsx-c862d6e6.js")
    );
    onExecute?.({ perf: { injectTime, loadTime: performance.now() - injectTime } });
  })().catch(console.error);

})();

