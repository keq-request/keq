---
"@keq-request/cli": major
---

**BREAKING CHANGE:** Move `fileNamingStyle`, `esm` and `additionalPropertiesType` into a `rendering` config object.

New options added to `rendering`:
- `additionalPropertiesType` - control how open object schemas render in generated types
- `entrypoint` - control index file generation (default: `false`)
