if (!window.queryPdfInjected) {
  window.queryPdfInjected = true
  setInterval(() => {
    document.querySelector('embed').postMessage({ type: 'getSelectedText' }, '*')
  }, 200)
}
