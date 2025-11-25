export default defineContentScript({
  matches: ["*://*.google.com/*"],
  main() {
    console.log("[SamAI Test] Content script loaded!", {
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
    
    // Test if showSidePanel function works
    setTimeout(() => {
      console.log("[SamAI Test] Testing showSidePanel function...");
      
      // Dynamically import and test the function
      import("@/src/content/search").then(({ showSidePanel }) => {
        console.log("[SamAI Test] showSidePanel function loaded, testing...");
        showSidePanel("Test message from content script", true);
        console.log("[SamAI Test] showSidePanel called successfully");
      }).catch(error => {
        console.error("[SamAI Test] Error loading showSidePanel:", error);
      });
    }, 2000);
  },
});