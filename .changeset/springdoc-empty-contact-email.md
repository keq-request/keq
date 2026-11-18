---
"@keq-request/cli": patch
---

**Fix:** `SpringdocCompatPlugin` now removes an empty-string `info.contact.email` before validation. Springdoc emits `"email": ""` for services without a configured contact, which previously failed `format: "email"` validation and aborted the whole build.
