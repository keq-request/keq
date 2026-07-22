---
"@keq-request/cache": minor
---

**Feat:** Add cache observability:

- Add `onCacheGet`, `onCacheSet`, `onCacheRemove`, `onCacheEvict` and `onCacheExpired` hooks for `MemoryStorage` and `IndexedDBStorage`
- Add `cache:hit`, `cache:miss` and `cache:update` keq events
- Add debug logs and `Server-Timing` header
- Add `print` method to display `MemoryStorage` entries
