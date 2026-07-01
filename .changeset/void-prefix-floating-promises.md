---
"@keq-request/cli": patch
---

**Fix:** add `void` prefix to generated `req.header()`, `req.query()`, `req.params()`, `req.type()`, `req.send()`, `req.attach()`, and `req.field()` statements to suppress `@typescript-eslint/no-floating-promises` lint errors, since `Keq` is now a real Promise.
