---
"keq": minor
---

**Feat:** Add `request.apply(...middlewares).exclude(...).forRoutes(...)` chainable API for route-scoped middleware registration. Supports AND/OR combination of route patterns and exclusion rules. Deprecates `useRouter()` and its shorthand methods.
