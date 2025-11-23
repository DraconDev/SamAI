# SamAI Todo

## 🚨 Priority 1: Fix Duplications (Quick Wins)
- [ ] **`optimizeHtmlContent` dup**: Remove from [`src/content/SearchPanel.tsx`](src/content/SearchPanel.tsx:359-388), import `{ optimizeHtmlContent, type OutputFormat }` from `"@/utils/page-content"`. Update calls in `handleSummarize`, `extractCurrentPageContent`.
- [ ] **Page extraction logic**: Centralize `extractCurrentPageContent`/`handleSummarize` content fetch to `utils/usePageContent.ts` hook.
- [ ] **Gradient button styles**: Extract to `src/components/ui/GradientButton.tsx`.
- [ ] **Loading spinners**: `src/components/ui/LoadingSpinner.tsx`.
- [ ] **Message handling boilerplate**: utils/background/messageHandlers.ts, utils/content/messageHandlers.ts.
- [ ] **Console logs**: utils/logger.ts.

## 🔧 Priority 2: Split Large Files (>200 lines)
### src/content/SearchPanel.tsx (1214 lines)
Follow existing plan:
- [ ] Setup: `src/components/search/types.ts`, `components/index.ts`
- [ ] Extract `TabNavigation.tsx` (~400 lines tabs)
- [ ] `SearchTab.tsx` (~200 lines response/Markdown)
- [ ] `ScrapeTab.tsx`, `ChatTab.tsx` (sub: MessagesList, InputForm), `SummaryTab.tsx`, `FormTab.tsx`, `ImageTab.tsx`
- [ ] Main: Container + Tailwind conversion (remove inline styles)

### entrypoints/background.ts (354 lines)
- [ ] Split handlers: `utils/background/handlers/search.ts`, `context.ts`, `input.ts`
- [ ] Main: Router dispatching to handlers.

### entrypoints/content.ts (376 lines)
- [ ] Split: `floatingIcon.ts`, `inputTracker.ts`, `messageHandlers.ts`

### utils/store.ts (183 lines)
- [ ] Split: `stores/chatStore.ts`, `searchStore.ts`, `apiKeyStore.ts`, `pageContextStore.ts`

## 🎨 Priority 3: Shared Components & Hooks
- [ ] `
