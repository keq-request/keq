---
"@keq-request/cli": patch
---

**Fix:** wrap all `$ref` with `v.lazy()` to handle circular schema references.
