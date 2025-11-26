;(function () {
  function isSubtitleRequest(url) {
    const apiPath = '/api/timedtext'
    return url.includes(apiPath)
  }
  const originOpen = XMLHttpRequest.prototype.open
  const open = function () {
    try {
      const _url = arguments[1]
      const searchObj = new URLSearchParams(document.location.search)
      const videoId = searchObj.get('v')
      const requestUrl = new URL(_url)
      const requestVideoId = requestUrl.searchParams.get('v')
      if (_url && isSubtitleRequest(_url) && videoId === requestVideoId) {
        window.postMessage({ type: 'monica-getTimedtextUrl', url: _url, videoId: videoId }, '*')
      }
    } catch (error) {
      // do nothing
    }

    return originOpen.apply(this, arguments)
  }
  Object.defineProperty(XMLHttpRequest.prototype, 'open', {
    value: open,
    writable: true,
  })
})()
