
# SamAI Todo

## Styling Fixes (Popup, Context-Popup, Chat)
- [x] Added stylesheet links to entrypoints/*/index.html (popup, chat, context-popup, apikey)
- [x] Reverted wxt.config.ts to stable (no vite plugin)
- [x] Converted inline minHeight in popup/App.tsx to Tailwind min-h-[500px]
- [ ] Reload extension in chrome://extensions after build to verify dark gradient bg, scrollbars
- [ ] Fix Tailwind v4 JIT (downgrade to v3 or vite plugin) for full utilities (p-6, shadow-2xl)

## Organize Massive src/content/SearchPanel.tsx (~1500 lines)
- [ ] **Setup**
  - [ ] Create src/content/SearchPanel/components/index.ts (barrel exports)
  - [ ] Create src/content/SearchPanel/types.ts (TabId, ChatMessage, etc.)
- [ ] **Extract TabNavigation (tabs grid, ~400 lines)**
  - [ ] Write src/content/SearchPanel/components/TabNavigation.tsx (props
