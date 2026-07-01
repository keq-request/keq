---
"@keq-request/cli": patch
---

**Fix:** deduplicate identical content-type union types in generated response type declarations.

When multiple content-types (e.g., `application/json`, `text/xml`, `application/vnd.api+json`) reference the same schema, the generated TypeScript type now produces `Schema` instead of `Schema | Schema | Schema`.
