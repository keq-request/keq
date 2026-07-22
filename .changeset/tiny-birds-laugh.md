---
"@keq-request/nestjs": major
"@keq-request/cli": minor
---

**BREAKING CHANGE:** Add NestJS integration with dependency injection pattern.

- Introduce `KeqMiddlewareConsumer` as an injectable service and `@InjectKeqConsumer()` decorator with `KeqConsumer<T>` for module-scoped middleware.
- Remove `KeqMiddlewareModule` interface and `configureKeqMiddleware()` lifecycle method. Middleware is now registered by injecting `KeqMiddlewareConsumer` or `KeqConsumer<T>` directly into services.
- Remove `KeqMiddlewareConsumer` interface — it is now a concrete `@Injectable()` class provided by `KeqModule`.
- Remove `hasConfigureKeqMiddleware()` utility function.
- Remove `forRoutes()` support for `KeqModuleClass` route targets. Use `KeqConsumer<T>` (injected via `@InjectKeqConsumer(ModuleClass)`) for module-scoped middleware.
- `KeqModuleClass` now requires a static `KEQ_CONSUMER: symbol` property in addition to `KEQ_REQUEST`.
- `KeqModule` no longer has a `register()` static method — it is now a bare `@Global()` module. Import `KeqModule` directly.
- Add `@InjectKeqConsumer(ModuleClass)` decorator, `KeqConsumer<T>` class, `KeqRouteTarget` type, and `KeqScopedConfigProxy<T>` interface.
- Add `exclude()` method to `KeqMiddlewareConfigProxy`, allowing middleware to skip specific routes.
- CLI-generated NestJS modules auto-import `KeqModule` and expose `KEQ_CONSUMER` symbol with `KeqConsumer` provider for `@InjectKeqConsumer()` injection.
