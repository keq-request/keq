---
"keq": minor
"@keq-request/cache": minor
---

**Feat:** Replace `fastq` with `Semaphore` in `flowControl` and cache middleware to preserve the caller's `AsyncLocalStorage` context, preventing queued requests from inheriting the wrong async context.
