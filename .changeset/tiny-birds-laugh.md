---
"@keq-request/nestjs": major
"@keq-request/cli": minor
---

**BREAKING CHANGE:** Refactor NestJS middleware configuration from lifecycle hook pattern to dependency injection pattern, introducing `KeqMiddlewareConsumer` as an injectable service and `@InjectKeqConsumer()` decorator with `KeqConsumer<T>` for module-scoped middleware.

- Remove `KeqMiddlewareModule` interface and `configureKeqMiddleware()` lifecycle method. Middleware is now registered by injecting `KeqMiddlewareConsumer` or `KeqConsumer<T>` directly into services.
- Remove `KeqMiddlewareConsumer` interface — it is now a concrete `@Injectable()` class provided by `KeqModule`.
- Remove `hasConfigureKeqMiddleware()` utility function.
- Remove `forRoutes()` support for `KeqModuleClass` route targets. Use `KeqConsumer<T>` (injected via `@InjectKeqConsumer(ModuleClass)`) for module-scoped middleware.
- `KeqModuleClass` now requires a static `KEQ_CONSUMER: symbol` property in addition to `KEQ_REQUEST`.
- `KeqModule` no longer has a `register()` static method — it is now a bare `@Global()` module. Import `KeqModule` directly.
- Add `@InjectKeqConsumer(ModuleClass)` decorator, `KeqConsumer<T>` class, `KeqRouteTarget` type, and `KeqScopedConfigProxy<T>` interface.
- CLI-generated NestJS modules now expose `KEQ_CONSUMER` symbol and provide a `KeqConsumer` provider for `@InjectKeqConsumer()` injection.
