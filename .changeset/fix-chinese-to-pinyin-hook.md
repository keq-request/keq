---
"@keq-request/cli": patch
---

**Fix:** move ChineseToPinyinPlugin from `afterDownload` to `beforeValidate` hook to prevent validation failures caused by Chinese characters in the spec.
