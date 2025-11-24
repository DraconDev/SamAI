# SamAI Todo - CRITICAL BUG FIXES 🚨

## 🚨 URGENT: Fix Broken Entry Points
**Issue**: Styling/functionality broken in main popup, right click menu, scrape page, open chat, configure API key, and new chat tab

### 🔍 Root Cause Analysis
- **Missing imports**: ToggleButton component path broken
- **Store functions**: Possibly missing or renamed functions
- **Component references**: Broken import paths after refactoring

### ✅ IDENTIFIED ISSUES
1. **popup/App.tsx**: Import path broken - ToggleButton from wrong location
2. **All entrypoints**: Need import path verification
3. **Store functions**: Verify all used functions still exist

### 🛠️ IMMEDIATE FIXES NEEDED
- [ ] Fix ToggleButton import in popup/App.tsx
- [ ] Verify all store function imports
- [ ] Check component import paths
- [ ] Test all entry points after fixes

---

**STATUS**: 🚨 CRITICAL - Extension functionality broken
**PRIORITY**: Fix import paths and broken functionality immediately