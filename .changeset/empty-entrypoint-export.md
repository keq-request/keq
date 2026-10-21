---
"@keq-request/cli": patch
---

**Fix:** When `rendering.entrypoint` is enabled, entrypoint files are now always generated for each module. Directories with no exportable content (for example, when `components.schemas` is empty or all schemas are inline) produce an `export {}` module instead of a missing entrypoint, preventing build failures and keeping the generated entrypoint structure consistent.
