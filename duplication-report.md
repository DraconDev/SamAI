# Duplication Analysis Report for SamAI Project

## Executive Summary
Analyzed the project structure, files, and code patterns. Identified several areas of duplication:
- **Files**: utils/logger.ts vs Reference/.../logger.ts; utils/store.ts vs Reference/.../store.ts; utils/markdown.tsx vs Reference/.../markdownToJSON.ts
- **Code Patterns**: 
  - `extractPageContent` logic duplicated in 3+ places (utils/page-content.ts, src/hooks/usePageContent.ts, inline in src/content/SearchPanel.tsx)
  - Entrypoint `main.tsx` boilerplate (ReactDOM.createRoot/render) identical across 5+ files
  - `storage.defineItem` patterns similar but different stores
  - Message handler routers in utils/background/messageHandlers.ts and utils/content/messageHandlers.ts
- **Directories**: `Reference/auto-form-filler/` appears to be a separate, unused reference project with parallel structure (entrypoints, utils, etc.)

**Impact**: Low for Reference (dead code), Medium for extractPageContent (cache logic inconsistent), Low for boilerplate (easy to DRY).

**Recommendations**: Below.

## 1. Reference/auto-form-filler/ Folder
- **Status**: Dead code. Full parallel project structure (entrypoints/popup/App.tsx etc., utils/logger.ts, store.ts).
- **Duplication**: logger.ts (different impl), store.ts (form-specific), markdownToJSON.ts (simple parser vs full ReactMarkdown).
- **Action**: Archive or delete. Not imported anywhere in main project.
  - `grep -r "auto-form-filler" .` shows no usage.

## 2. extractPageContent Duplication
- **Locations**:
  - [`utils/page-content.ts`](utils/page-content.ts:10): Core sync function.
  - [`src/hooks/usePageContent.ts`](src/hooks/usePageContent.ts:7): Async wrapper with cache/fresh.
  - Inline in [`src/content/SearchPanel.tsx`](src/content/SearchPanel.tsx:96): Duplicated async cache logic.
- **Issue**: Inconsistent caching, HTML optimization repeated.
- **Refactor**:
  - Enhance `utils/page-content.ts` with async `extractPageContentAsync(format: OutputFormat, fresh?: boolean): Promise<string>`
  - Update hook and SearchPanel to import/use it.
  - Remove inline duplication.

## 3. Entrypoint Boilerplate (main.tsx)
- **Pattern**: All use `ReactDOM.createRoot` or `createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>)`
- **Files**:
  | File | Lines |
  |------|-------|
  | entrypoints/apikey/main.tsx | 1-10 |
  | entrypoints/chat/main.tsx | 1-10 |
  | entrypoints/context-popup/main.tsx | 1-11 |
  | entrypoints/popup/main.tsx | 1-10 |
  | Reference/auto-form-filler/entrypoints/popup/main.tsx | Similar |
- **Refactor**: Create `utils/mountApp.ts`:
  ```ts
  import { createRoot } from 'react-dom/client';
  import React from 'react';
  import type { FC } from 'react';

  export function mountApp(AppComponent: FC, rootId = 'root'): void {
    const root = createRoot(document.getElementById(rootId)!);
    root.render(<React.StrictMode><AppComponent /></React.StrictMode>);
  }
  ```
  - Update main.tsx: `import { mountApp } from '@/utils/mountApp'; import App from './App'; mountApp(App);`

## 4. Logger & Store Duplication
- **Logger**: utils/logger.ts (advanced SamAILogger) vs Reference simple log().
- **Store**: utils/store.ts (chat, settings, apiKeys) vs Reference form fields.
- **Action**: Ignore Reference. Align if integrating form-filler.

## 5. index.html Similarity
- All entrypoints: Nearly identical <!DOCTYPE>, head, body with #root and script src="./main.tsx"
- **Refactor**: Use build-time templating (WXT already handles?).

## 6. Message Handlers
- Similar router patterns, but context-specific (background vs content).
- **Low priority**: Good separation.

## Prioritized Refactors
1. **High**: Delete Reference/ or mv to examples/
2. **High**: Dedupe extractPageContent
3. **Medium**: Shared mountApp
4. **Low**: Align loggers/stores if needed

Total estimated savings: ~200 LOC removed/refactored.

Generated: 2025-11-25