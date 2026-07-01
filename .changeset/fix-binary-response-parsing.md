---
"keq": minor
"@keq-request/cli": minor
---

**Feat:** Align intelligent response parsing and CLI code generation by using `content-type` / media type as the primary signal for binary detection.

- `intelligentParseResponse` now returns `ArrayBuffer` for recognized binary content types: `image/*`, `audio/*`, `video/*`, `font/*`, `application/octet-stream`, and `application/pdf`
- Fixed a bug where `text/plain` responses were not correctly detected (`plain/text` → `text/` prefix check), and extended support to all `text/*` types
- Unknown content types still return `undefined` to encourage explicit handling via `.resolveWith()`
- CLI now checks the response's media type key at the response level in addition to schema-level `format: binary` / `contentMediaType` checks
- CLI generated types changed from `Blob | Buffer` to `ArrayBuffer` for binary schemas to match runtime behavior
