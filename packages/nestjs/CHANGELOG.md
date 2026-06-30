# @keq-request/nestjs

## 5.0.0-beta.14

### Major Changes

- 23c971f: **BREAKING CHANGE:** Refactor NestJS middleware configuration from lifecycle hook pattern to dependency injection pattern, introducing `KeqMiddlewareConsumer` as an injectable service and `@InjectKeqConsumer()` decorator with `KeqConsumer<T>` for module-scoped middleware.

  - Remove `KeqMiddlewareModule` interface and `configureKeqMiddleware()` lifecycle method. Middleware is now registered by injecting `KeqMiddlewareConsumer` or `KeqConsumer<T>` directly into services.
  - Remove `KeqMiddlewareConsumer` interface — it is now a concrete `@Injectable()` class provided by `KeqModule`.
  - Remove `hasConfigureKeqMiddleware()` utility function.
  - Remove `forRoutes()` support for `KeqModuleClass` route targets. Use `KeqConsumer<T>` (injected via `@InjectKeqConsumer(ModuleClass)`) for module-scoped middleware.
  - `KeqModuleClass` now requires a static `KEQ_CONSUMER: symbol` property in addition to `KEQ_REQUEST`.
  - `KeqModule` no longer has a `register()` static method — it is now a bare `@Global()` module. Import `KeqModule` directly.
  - Add `@InjectKeqConsumer(ModuleClass)` decorator, `KeqConsumer<T>` class, `KeqRouteTarget` type, and `KeqScopedConfigProxy<T>` interface.
  - CLI-generated NestJS modules now expose `KEQ_CONSUMER` symbol and provide a `KeqConsumer` provider for `@InjectKeqConsumer()` injection.

### Patch Changes

- keq@5.0.0-beta.14

## 5.0.0-beta.13

### Patch Changes

- 59f4773: **Fix:** ensure `configureKeqMiddleware()` works correctly in pnpm monorepos and validate module imports at startup.

  - Fix middleware not being applied when pnpm creates multiple `@keq-request/nestjs` instances due to peerDependency version differences.
  - Detect missing `KeqModule` imports in modules that implement `configureKeqMiddleware()` at startup, throwing a clear error instead of silently skipping middleware.
  - Prevent middleware from being applied more than once when multiple `KeqModule` instances exist.
  - Throw a descriptive error when a NestJS middleware class passed to `consumer.apply()` is not registered as a provider.
  - keq@5.0.0-beta.13

## 5.0.0-beta.12

### Minor Changes

- fbc851f: **Feat:** Add `exclude()` method to `KeqMiddlewareConfigProxy`, allowing middleware to skip specific routes. Supports `KeqRouteInfo` with `host`, `method`, and `pathname` patterns, following the NestJS `MiddlewareConfigProxy.exclude()` convention.

### Patch Changes

- keq@5.0.0-beta.12

## 5.0.0-beta.11

### Patch Changes

- keq@5.0.0-beta.11

## 5.0.0-beta.10

### Minor Changes

- 2e13e75: **BREAKING CHANGE:** Remove `request` option from `KeqModuleOptions`, use fork-based instance isolation instead.

### Patch Changes

- Updated dependencies [95908fd]
  - keq@5.0.0-beta.10

## 5.0.0-beta.9

### Patch Changes

- keq@5.0.0-beta.9

## 5.0.0-beta.8

### Patch Changes

- keq@5.0.0-beta.8

## 5.0.0-beta.7

### Patch Changes

- keq@5.0.0-beta.7

## 5.0.0-beta.6

### Patch Changes

- keq@5.0.0-beta.6

## 5.0.0-beta.5

### Patch Changes

- keq@5.0.0-beta.5

## 5.0.0-beta.4

### Patch Changes

- keq@5.0.0-beta.4

## 5.0.0-beta.3

### Patch Changes

- keq@5.0.0-beta.3

## 5.0.0-beta.2

### Patch Changes

- keq@5.0.0-beta.2

## 5.0.0-beta.1

### Minor Changes

- 437fc0c: **Feat:** nestjs supported。

### Patch Changes

- Updated dependencies [cbc5d17]
- Updated dependencies [153244f]
- Updated dependencies [153244f]
- Updated dependencies [153244f]
- Updated dependencies [0a2eb2f]
- Updated dependencies [153244f]
- Updated dependencies [214ae66]
- Updated dependencies [c7ffd1f]
- Updated dependencies [90311b3]
- Updated dependencies [1f367c0]
- Updated dependencies [0c7db81]
- Updated dependencies [df114d1]
- Updated dependencies [2686b8d]
- Updated dependencies [842e555]
- Updated dependencies [153244f]
- Updated dependencies [2686b8d]
- Updated dependencies [9290139]
- Updated dependencies [7873a0a]
- Updated dependencies [e7eb9dc]
- Updated dependencies [7ff2162]
- Updated dependencies [22ce01a]
- Updated dependencies [0873c7e]
- Updated dependencies [153244f]
- Updated dependencies [a7a83da]
- Updated dependencies [f194c41]
- Updated dependencies [153244f]
- Updated dependencies [153244f]
- Updated dependencies [d076b76]
- Updated dependencies [f8abc63]
- Updated dependencies [153244f]
- Updated dependencies [ca6c879]
- Updated dependencies [63161c4]
- Updated dependencies [d472648]
- Updated dependencies [b8d02ca]
- Updated dependencies [0a04864]
- Updated dependencies [581815a]
- Updated dependencies [7343445]
- Updated dependencies [153244f]
- Updated dependencies [eed26f9]
  - keq@5.0.0-beta.1

## 5.0.0-alpha.36

### Patch Changes

- keq@5.0.0-alpha.36

## 5.0.0-alpha.35

### Patch Changes

- Updated dependencies [0a04864]
  - keq@5.0.0-alpha.35

## 5.0.0-alpha.34

### Patch Changes

- Updated dependencies [a7a83da]
- Updated dependencies [f8abc63]
  - keq@5.0.0-alpha.34

## 5.0.0-alpha.33

### Patch Changes

- keq@5.0.0-alpha.33

## 5.0.0-alpha.32

### Patch Changes

- Updated dependencies [f194c41]
- Updated dependencies [b8d02ca]
  - keq@5.0.0-alpha.32

## 5.0.0-alpha.31

### Patch Changes

- keq@5.0.0-alpha.31

## 5.0.0-alpha.30

### Patch Changes

- keq@5.0.0-alpha.30

## 5.0.0-alpha.29

### Patch Changes

- keq@5.0.0-alpha.29

## 5.0.0-alpha.28

### Patch Changes

- Updated dependencies [d076b76]
  - keq@5.0.0-alpha.28

## 5.0.0-alpha.27

### Patch Changes

- Updated dependencies [0c7db81]
  - keq@5.0.0-alpha.27

## 5.0.0-alpha.26

### Patch Changes

- Updated dependencies [22ce01a]
- Updated dependencies [63161c4]
  - keq@5.0.0-alpha.26

## 5.0.0-alpha.25

### Patch Changes

- Updated dependencies [214ae66]
- Updated dependencies [9290139]
  - keq@5.0.0-alpha.25

## 5.0.0-alpha.24

### Patch Changes

- Updated dependencies [0a2eb2f]
  - keq@5.0.0-alpha.24

## 5.0.0-alpha.23

### Minor Changes

- 437fc0c: **Feat:** nestjs supported。

### Patch Changes

- Updated dependencies [842e555]
- Updated dependencies [7873a0a]
  - keq@5.0.0-alpha.23
