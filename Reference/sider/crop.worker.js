onmessage = function (e) {
  if (e.data.action === 'crop') {
    var readable = e.data.readable
    var writable = e.data.writable
    var visibleRect = e.data.visibleRect
    readable
      .pipeThrough(
        new TransformStream({
          transform(frame, controller) {
            var newFrame = new VideoFrame(frame, {
              visibleRect
            })
            controller.enqueue(newFrame)
            frame.close()
          }
        })
      )
      .pipeTo(writable)
    postMessage({ action: 'crop-worker' })
  }
}
