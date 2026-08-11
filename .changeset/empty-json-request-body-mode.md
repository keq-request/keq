---
"@keq-request/cli": minor
---

**Feat:** Add `rendering.emptyJsonRequestBodyMode` to control how empty request body is handled for `application/json` requests when all body properties are optional and none are provided.

- `'strict'` (default): Always renders `req.type("application/json")`, no body fallback — keeps current behavior
- `'omit'`: Skips `req.type("application/json")`; `req.send()` auto-sets Content-Type when needed
- `'empty-object'`: Sends `req.send({})` when no body properties are provided
- `'null'`: Sends `req.send(null)` when no body properties are provided

Deprecates `SpringdocCompatPlugin`'s `ensureJsonBody` option. Use `rendering.emptyJsonRequestBodyMode: 'empty-object'` instead.
