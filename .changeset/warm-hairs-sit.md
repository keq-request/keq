---
"@keq-request/nestjs": minor
---

**Feat:** Add `exclude()` method to `KeqMiddlewareConfigProxy`, allowing middleware to skip specific routes. Supports `KeqRouteInfo` with `host`, `method`, and `pathname` patterns, following the NestJS `MiddlewareConfigProxy.exclude()` convention.
