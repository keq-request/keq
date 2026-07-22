---
"keq": minor
---

**Feat:** Enhance `.flowControl()` with new modes:

- Add `mutex` mode that rejects new requests when a request with the same signal key is already in-flight, throwing `MutexException`
- Add `concurrency` mode for controlling concurrent request limits
