---
"keq": minor
"@keq-request/cli": minor
---

**Feat:** Add `rendering.v2Compat` option and restore `KeqRouter.module()` for v2 backward compatibility.

- `@keq-request/cli`: When `rendering.v2Compat` is `true`, generated micro-functions emit `.option('module', { name: moduleName, pathname, method })` matching v2 output.
- `keq`: Restore deprecated `KeqRouter.module()` instance/static method and `keqModuleRoute()` route factory, enabling module-based middleware routing for v2 consumers.
