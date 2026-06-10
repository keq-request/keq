---
"keq": minor
---

**Feat:** add `mutex` flow control mode that rejects new requests when a request with the same signal key is already in-flight, throwing `MutexException`
