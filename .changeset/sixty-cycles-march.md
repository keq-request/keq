---
"@keq-request/nestjs": patch
---

**Fix:** ensure `configureKeqMiddleware()` works correctly in pnpm monorepos and validate module imports at startup.

- Fix middleware not being applied when pnpm creates multiple `@keq-request/nestjs` instances due to peerDependency version differences.
- Detect missing `KeqModule` imports in modules that implement `configureKeqMiddleware()` at startup, throwing a clear error instead of silently skipping middleware.
- Prevent middleware from being applied more than once when multiple `KeqModule` instances exist.
- Throw a descriptive error when a NestJS middleware class passed to `consumer.apply()` is not registered as a provider.
