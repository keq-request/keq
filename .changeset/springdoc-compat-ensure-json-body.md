---
"@keq-request/cli": patch
---

**Perf:** Add `ensureJsonBody` option to `SpringdocCompatPlugin`. When enabled, generated code automatically sends an empty object `{}` for application/json requests, ensuring compatibility with Spring Boot Jackson which rejects requests without a body.
