---
"keq": minor
---

**Feat:** Add `.abort(reason?)` and `.abortWhen(signalOrPromise)` request methods for aborting requests. `.abort()` aborts manually, while `.abortWhen()` aborts when the given `AbortSignal` aborts or the given `Promise` settles, so it works with the normal `await` flow. Aborting rejects the request with an `AbortException` (or the given reason), emits the `abort` event, and prevents pending retries. `.fire()` now returns the request instance, so it can still be used afterwards, e.g. `request.get(url).fire().abort()`.
