(function() {
    const importPath = /*@__PURE__*/ JSON.parse('"content.js"');
    import(chrome.runtime.getURL(importPath));
})();