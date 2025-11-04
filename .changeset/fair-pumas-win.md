---
"keq": major
---

**BREAKING CHANGE:** `.params(key, value)` will not encode value automatically, please replace it with `.params(key, encodeURIComponent(value)`, if necessary.
