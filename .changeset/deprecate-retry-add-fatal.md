---
"keq": patch
---

Add `fatal` property to `RequestException` as replacement for the deprecated `retry` property. `fatal: true` means the error should not be retried (equivalent to old `retry: false`). The `retry` property is preserved as a deprecated getter for backward compatibility.
