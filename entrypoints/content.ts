export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    document.addEventListener('contextmenu', (event) => {
      const target = event.target as HTMLElement;
      
      // Store clicked element info on document body
      document.body.dataset.clickedElement = JSON.stringify({
        tagName: target.tagName.toLowerCase(),
        id: target.id,
        className: target.className,
        text: target.textContent?.trim(),
        href: target instanceof HTMLAnchorElement ? target.href : null,
        src: target instanceof HTMLImageElement ? target.src : null
      });
    });
  },
});
