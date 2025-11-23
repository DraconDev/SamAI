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
  - [ ] Write src/content/SearchPanel/components/TabNavigation.tsx (props: activeTab, setActiveTab, handlers, isScraping)
  - [ ] replace_in_file SearchPanel.tsx: Replace Tab Navigation div with <TabNavigation {...props} />
- [ ] **Extract SearchTabContent (~200 lines)**
  - [ ] Write SearchTabContent.tsx (response, isApiKeySet, outputFormat, MarkdownRenderer, API setup, loading)
  - [ ] Replace {activeTab === "search" && (...)}
- [ ] **Extract ScrapeTabContent (~50 lines)**
  - [ ] Write ScrapeTabContent.tsx (handleScrape, isScraping)
- [ ] **Extract ChatTabContent (~600 lines)**
  - [ ] Write ChatTabContent.tsx (all chat state/handlers)
  - [ ] Sub-extract ChatMessagesList.tsx, ChatInputForm.tsx
- [ ] **Extract SummaryTabContent (~100 lines)**
  - [ ] Write SummaryTabContent.tsx (isSummarizing, summary, summaryError)
- [ ] **Extract FormTabContent & ImageTabContent (~100 lines)**
- [ ] **Main SearchPanel cleanup (~200 lines left)**
  - [ ] Remove unused functions (move to utils)
- [ ] **Tailwind Conversion**
  - [ ] Replace all inline style={{}} with Tailwind arbitrary (w-[450px], backdrop-blur-xl, etc.)
  - [ ] Move <style> blocks to entrypoints/style.css
- [ ] **Test**
  - [ ] bun run build
  - [ ] Reload extension, test tabs/functions

## Full Tailwind Project Conversion
- [ ] Scan all .tsx for inline style= , convert to Tailwind
- [ ] Update tailwind.config.js content paths
- [ ] Downgrade Tailwind v4 -> v3 (match Ref/auto-form-filler)

## Next Features
- [ ] Popup styling full utilities
- [ ] SearchPanel Tailwind
