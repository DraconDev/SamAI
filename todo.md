# SamAI Todo

## 🚨 Priority 1: Fix Duplications
- [x] `optimizeHtmlContent`: Remove dup from SearchPanel.tsx (359-388), import from utils/page-content.ts
- [x] Page extraction: Centralize to src/hooks/usePageContent.ts
- [x] Gradient buttons/loaders: src/components/ui/GradientButton.tsx, LoadingSpinner.tsx
- [x] Types: src/content/SearchPanel/types.ts
- [x] Components barrel: src/content/SearchPanel/components/index.ts
- [ ] Message handlers: utils/background/handlers/, utils/content/handlers/
- [x] Logs: utils/logger.ts

## 🔧 Priority 2: Split Large Files
### SearchPanel.tsx (1214 lines)
- [ ] Setup: src/components/search/types.ts, components/index.ts
- [ ] TabNavigation.tsx (tabs)
- [ ] SearchTab.tsx, ScrapeTab.tsx, ChatTab.tsx (sub: MessagesList, InputForm), SummaryTab.tsx, Form/Image tabs
- [ ] Tailwind: Remove inline styles

### background.ts (354), content.ts (376)
- [ ] Split handlers to utils/background|content/handlers/

### store.ts (183)
- [ ] Split stores/chatStore.ts, searchStore.ts, apiKeyStore.ts

## 🎨 Priority 3: Shared & Hooks
- [ ] ui/: GradientButton, Toggle, Spinner, TabButton
- [ ] hooks/: usePageContent, useAI, useStores
- [ ] types/: messages.ts, stores.ts

## 🧹 Priority 4: Cleanup
- [ ] Tailwind all inline styles (search.ts, SearchPanel)
- [ ] Remove Reference/ if unused
- [ ] Consistent errors

## 📦 Priority 5: Polish
- [ ] Tailwind v3 downgrade
- [ ] Test builds/reloads
