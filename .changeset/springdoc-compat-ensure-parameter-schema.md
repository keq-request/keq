---
"@keq-request/cli": patch
---

**Perf:** SpringdocCompatPlugin now adds `schema: {}` to parameters that are missing both `schema` and `content`, preventing OpenAPI validation errors with Springdoc-generated documents.
