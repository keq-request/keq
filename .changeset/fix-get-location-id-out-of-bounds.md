---
"keq": patch
---

**Fix:** Prevent `getLocationId` from throwing `TypeError` when the call stack is shallower than expected (e.g. JavaScriptCore on iOS Safari omits async stack frames), which crashed every request in shallow-stack contexts. It now falls back to the deepest non-empty frame instead of calling `.trim()` on `undefined`.
