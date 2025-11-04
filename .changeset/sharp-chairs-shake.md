---
"keq": major
---

**BREAKING CHANGE:** change KeqRequest from interface to class.

- `request` cannot be invoke directly, please use `request.fetch()` instead.
- `KeqOptions` renamed to `KeqMiddlewareOptions`.
- `KeqOperations` renamed to `KeqApiSchema`.
- `KeqBaseOperation` renamed to `KeqDefaultOperation`.
