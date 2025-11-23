# Chrome Extension Development: Bun, WXT, React, TypeScript, Tailwind CSS

**Objective:** Build a Chrome extension using this tech stack.

**Technology Stack:**

-   **Runtime:** Bun (Install packages: `bun add`, Run scripts: `bunx`)
-   **Extension Framework:** WXT (Handles `manifest.json`, entry points)
-   **Frontend:** React (Popup & Options UI, use components)
-   **Language:** TypeScript (Type-safe JavaScript)
-   **Styling:** Tailwind CSS (**Only utility classes, no custom CSS**)
-   **Data Storage:** `chrome.storage.sync` (Use `set()` and `get()`)

**Setup:**

1. **Install Tailwind:** `bun add -D tailwindcss postcss autoprefixer`
2. **Init Tailwind:** `bunx tailwindcss init -p`
3. **Update `tailwind.config.js`:**
    ```
    content: [
        "./entrypoints/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    ```

**Key Considerations:**

-   **Error Handling:** **Mandatory `try...catch` blocks.**
-   **Logging:** Use `// console.log()` (info), `console.warn()`, `console.error()`.
-   **UX:** Simple, intuitive UI; provide user feedback.
-   **Performance:** Optimize background script; minimize resource use.
-   **Accessibility:** Follow accessibility guidelines (WCAG).

**Further Instructions:**

-   Consult official documentation.
-   Feature-specific instructions to follow.
