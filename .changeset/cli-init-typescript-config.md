---
"@keq-request/cli": patch
---

**Fix:** `keq init` now generates `.keqrc.mjs` / `.keqrc.js` instead of `.keqrc.ts` when `typescript` 5.x/6.x cannot be resolved, so the generated config always loads.
