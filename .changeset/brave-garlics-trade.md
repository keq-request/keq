---
"keq": major
---

**BREAKING CHANGE:** The `.query(key, [1,2])` method now returns `"key[]=1&key[]=2"` instead of `"key=1&key=2"`.
