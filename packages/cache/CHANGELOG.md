# Changelog

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

- ff5464b: Prevent other middlewares from inadvertently modifying the cache key.
  - keq@5.0.0-alpha.29

## 5.0.0-alpha.28

### Patch Changes

- Updated dependencies [d076b76]
  - keq@5.0.0-alpha.28

## 5.0.0-alpha.27

### Patch Changes

- bbfda6b: Fix the error throw when set server-timing header.
- 5d2ce07: **Perf:** add blocking for concurrent requests with same cache key.
- Updated dependencies [0c7db81]
  - keq@5.0.0-alpha.27

## 5.0.0-alpha.26

### Patch Changes

- Updated dependencies [22ce01a]
- Updated dependencies [63161c4]
  - keq@5.0.0-alpha.26

## 5.0.0-alpha.25

### Minor Changes

- d1090d3: **Feat:** add debug logs and Server-Timing header.

### Patch Changes

- Updated dependencies [214ae66]
- Updated dependencies [9290139]
  - keq@5.0.0-alpha.25

## 5.0.0-alpha.24

### Patch Changes

- Updated dependencies [0a2eb2f]
  - keq@5.0.0-alpha.24

## 5.0.0-alpha.23

### Major Changes

- 5f5bdd9: **BREAKING CHANGE:** Simplified KeqCacheStrategy interface.

### Minor Changes

- 9ab2c64: Convert non-essential cli tasks into plugins.

### Patch Changes

- b8d68c7: **Fix:** IndexedDBStorage cannot evict ttl cache
- 20c7067: **Fix:** Failed to automatically clean up expired cache data when get immediately after initialization.
- 9a9caa4: Cannot call CacheEntry.response.json multiple times.
- Updated dependencies [842e555]
- Updated dependencies [7873a0a]
  - keq@5.0.0-alpha.23

## 5.0.0-alpha.22

### Patch Changes

- Updated dependencies [df114d1]
  - keq@5.0.0-alpha.22

## 5.0.0-alpha.21

### Minor Changes

- 25414cb: add print method to display MemoryStorage entries

### Patch Changes

- Updated dependencies [90311b3]
  - keq@5.0.0-alpha.21

## 5.0.0-alpha.20

### Patch Changes

- Updated dependencies [1f367c0]
  - keq@5.0.0-alpha.20

## 5.0.0-alpha.19

### Patch Changes

- keq@5.0.0-alpha.19

## 5.0.0-alpha.18

### Patch Changes

- Updated dependencies [cbc5d17]
  - keq@5.0.0-alpha.18

## 5.0.0-alpha.17

### Patch Changes

- Updated dependencies [d472648]
- Updated dependencies [eed26f9]
  - keq@5.0.0-alpha.17

## 5.0.0-alpha.16

### Patch Changes

- Updated dependencies [ca6c879]
  - keq@5.0.0-alpha.16

## 5.0.0-alpha.15

### Patch Changes

- keq@5.0.0-alpha.15

## 5.0.0-alpha.14

### Patch Changes

- keq@5.0.0-alpha.14

## 5.0.0-alpha.13

### Patch Changes

- keq@5.0.0-alpha.13

## 5.0.0-alpha.12

### Patch Changes

- 581815a: ensure compatibility
- Updated dependencies [581815a]
  - keq@5.0.0-alpha.12

## 5.0.0-alpha.11

### Minor Changes

- 54520a9: **Feat:** using `.option('cache', false)` can disable caching for request that are cached by default
- 89274bd: **Feat:** add a Size enum make it easier to set the size

### Patch Changes

- Updated dependencies [c7ffd1f]
  - keq@5.0.0-alpha.11

## 5.0.0-alpha.10

### Patch Changes

- e7eb9dc: Don't publish .turbo and jest.config.cts to npm
- 7343445: Incorrect build before release
- Updated dependencies [e7eb9dc]
- Updated dependencies [7343445]
  - keq@5.0.0-alpha.10

## 5.0.0-alpha.9

### Patch Changes

- 2686b8d: build with burbo
- 2686b8d: remove private dependencies
- Updated dependencies [2686b8d]
- Updated dependencies [2686b8d]
  - keq@5.0.0-alpha.9

## 5.0.0-alpha.8

### Patch Changes

- 0873c7e: Incorrect build before release.
- Updated dependencies [0873c7e]
  - keq@5.0.0-alpha.8

## 5.0.0-alpha.7

### Major Changes

- 5175097: **BREAKING CHANGE:** group all packages under the @keq-request scope

  - keq-cache => @keq-request/cache
  - keq-headers => @keq-request/headers
  - keq-cli => @keq-request/cli
  - keq-url => @keq-request/url
  - keq-exception => @keq-request/exception

- 153244f: **BREAKING CHANGE:** `onNetworkResponse` has been removed, please use `.on('cache:update', callback)` instead.

### Minor Changes

- 153244f: **Feat:** Add `onCacheGet`, `onCacheSet`, `onCacheRemove`, `onCacheEvict` and `onCacheExpired` hook for `MemoryStorage` and `IndexedDBStorage`.
- 153244f: **Feat:** Add `cache:hit`, `cache:miss` and `cache:update` to keq events.

### Patch Changes

- 153244f: **Feat:** `pattern` accept boolean and defaults to true
- 153244f: **Fix:** unable to cache modified `ctx.res`.
- Updated dependencies [153244f]
- Updated dependencies [153244f]
- Updated dependencies [153244f]
- Updated dependencies [153244f]
- Updated dependencies [153244f]
- Updated dependencies [7ff2162]
- Updated dependencies [153244f]
- Updated dependencies [153244f]
- Updated dependencies [153244f]
- Updated dependencies [153244f]
- Updated dependencies [153244f]
  - keq@5.0.0-alpha.7

## [2.1.1](https://github.com/keq-request/keq-cache/compare/v2.1.0...v2.1.1) (2025-07-11)

### Bug Fixes

- missing .js ext ([609631a](https://github.com/keq-request/keq-cache/commit/609631af7334fa41f42b9607137c61be1435e29e))

## [2.1.0](https://github.com/keq-request/keq-cache/compare/v2.0.0...v2.1.0) (2025-07-03)

### Features

- add MultiTierStorage ([07a293b](https://github.com/keq-request/keq-cache/commit/07a293b75689c33ee05f31bd3446856244f83aa4))
- add TierStorage ([02ceb48](https://github.com/keq-request/keq-cache/commit/02ceb4885f8a413fddd9fa732c0a2223a809b1f5))
- custom strategy ([3053306](https://github.com/keq-request/keq-cache/commit/3053306cfa408b9ed72a1d5fbbb9d4bbdfe7e816))

### Bug Fixes

- wrong class name ([91989ea](https://github.com/keq-request/keq-cache/commit/91989eaeb1241d16128f08351f95b7b1b1c9fd22))

## [2.0.0](https://github.com/keq-request/keq-cache/compare/v1.2.2...v2.0.0) (2025-05-26)

### ⚠ BREAKING CHANGES

- maxStorageSize and threshold is removed, please use size parameter of Storage

### Features

- custom storage support ([bebd310](https://github.com/keq-request/keq-cache/commit/bebd3106c735fcb5b12142a3d1c19025806a2098))

### Bug Fixes

- memory storage does not specify the isolation scope ([99da6d7](https://github.com/keq-request/keq-cache/commit/99da6d7c23b2b91eb12075195a5d55ae1021fab0))

## [1.2.2](https://github.com/keq-request/keq-cache/compare/v1.2.1...v1.2.2) (2025-04-27)

### Performance Improvements

- skip cache if indexed-db not work ([45ccbd8](https://github.com/keq-request/keq-cache/commit/45ccbd8d42ce7bf14fc03f98b7a8ce162c61e43d)), closes [#10](https://github.com/keq-request/keq-cache/issues/10)

## [1.2.1](https://github.com/keq-request/keq-cache/compare/v1.2.0...v1.2.1) (2025-04-23)

### Bug Fixes

- should not add proxy to indexed db ([02b5442](https://github.com/keq-request/keq-cache/commit/02b54429856f4e343cd04d98cfb78a1d99e31249))

## [1.2.0](https://github.com/keq-request/keq-cache/compare/v1.1.0...v1.2.0) (2025-04-22)

### Features

- add exclude options used exlcude the response should not be cached ([4f6aa79](https://github.com/keq-request/keq-cache/commit/4f6aa793b4aa671695ee1e792dcf1de83b66b37b))

### Bug Fixes

- response is consumed abnormally ([3b6d204](https://github.com/keq-request/keq-cache/commit/3b6d204f94982219e27f751b162396bd1ff27548))

## [1.1.0](https://github.com/keq-request/keq-cache/compare/v1.0.6...v1.1.0) (2025-04-18)

### Features

- add onNetworkResponse event ([d9b94d0](https://github.com/keq-request/keq-cache/commit/d9b94d0e5d3dd172d48c8228ba51ad32d1eeee41))

## [1.0.6](https://github.com/keq-request/keq-cache/compare/v1.0.5...v1.0.6) (2025-04-16)

### Bug Fixes

- cannot find idb package ([b33e267](https://github.com/keq-request/keq-cache/commit/b33e267b7eb845e9e78c2ccb5d2a33db0ee7973a))

## [1.0.5](https://github.com/keq-request/keq-cache/compare/v1.0.4...v1.0.5) (2025-04-16)

### Bug Fixes

- cannot find idb package ([031f453](https://github.com/keq-request/keq-cache/commit/031f45358713cff0fe95a13613c2bf8b72fcb5c8))

## [1.0.4](https://github.com/keq-request/keq-cache/compare/v1.0.3...v1.0.4) (2024-11-25)

### Bug Fixes

- indexed-db not work ([187ed1f](https://github.com/keq-request/keq-cache/commit/187ed1ff399ca681a683c2b4d615963aced202b8))

## [1.0.3](https://github.com/keq-request/keq-cache/compare/v1.0.2...v1.0.3) (2024-11-19)

### Bug Fixes

- update import statements to include file extensions for esm ([f7118ee](https://github.com/keq-request/keq-cache/commit/f7118eeb2913ce48dc2bc53c99b831d52ecb8098))

## [1.0.2](https://github.com/keq-request/keq-cache/compare/v1.0.1...v1.0.2) (2024-11-19)

### Bug Fixes

- update import statements to include file extensions for esm ([49ed02f](https://github.com/keq-request/keq-cache/commit/49ed02f64e15f14a04c8f54281b913545db97af2))

## 1.0.1 (2024-11-18)

### Bug Fixes

- ctx.options.cache not working ([4f327eb](https://github.com/keq-request/keq-cache/commit/4f327eb887698b51cb44ebe4742f9e79a94fa30d))
- update cache strategy handling to enforce required strategy option ([7798327](https://github.com/keq-request/keq-cache/commit/77983270544286046ab47df11b39c054fa84164e))

### Miscellaneous Chores

- release 1.0.1 ([6dcfd9d](https://github.com/keq-request/keq-cache/commit/6dcfd9d94ad82f0726d5c4031291ece719bd766c))
