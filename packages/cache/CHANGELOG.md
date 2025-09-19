# Changelog

## [2.1.1](https://github.com/keq-request/keq-cache/compare/v2.1.0...v2.1.1) (2025-07-11)


### Bug Fixes

* missing .js ext ([609631a](https://github.com/keq-request/keq-cache/commit/609631af7334fa41f42b9607137c61be1435e29e))

## [2.1.0](https://github.com/keq-request/keq-cache/compare/v2.0.0...v2.1.0) (2025-07-03)


### Features

* add MultiTierStorage ([07a293b](https://github.com/keq-request/keq-cache/commit/07a293b75689c33ee05f31bd3446856244f83aa4))
* add TierStorage ([02ceb48](https://github.com/keq-request/keq-cache/commit/02ceb4885f8a413fddd9fa732c0a2223a809b1f5))
* custom strategy ([3053306](https://github.com/keq-request/keq-cache/commit/3053306cfa408b9ed72a1d5fbbb9d4bbdfe7e816))


### Bug Fixes

* wrong class name ([91989ea](https://github.com/keq-request/keq-cache/commit/91989eaeb1241d16128f08351f95b7b1b1c9fd22))

## [2.0.0](https://github.com/keq-request/keq-cache/compare/v1.2.2...v2.0.0) (2025-05-26)


### ⚠ BREAKING CHANGES

* maxStorageSize and threshold is removed, please use size parameter of Storage

### Features

* custom storage support ([bebd310](https://github.com/keq-request/keq-cache/commit/bebd3106c735fcb5b12142a3d1c19025806a2098))


### Bug Fixes

* memory storage does not specify the isolation scope ([99da6d7](https://github.com/keq-request/keq-cache/commit/99da6d7c23b2b91eb12075195a5d55ae1021fab0))

## [1.2.2](https://github.com/keq-request/keq-cache/compare/v1.2.1...v1.2.2) (2025-04-27)


### Performance Improvements

* skip cache if indexed-db not work ([45ccbd8](https://github.com/keq-request/keq-cache/commit/45ccbd8d42ce7bf14fc03f98b7a8ce162c61e43d)), closes [#10](https://github.com/keq-request/keq-cache/issues/10)

## [1.2.1](https://github.com/keq-request/keq-cache/compare/v1.2.0...v1.2.1) (2025-04-23)


### Bug Fixes

* should not add proxy to indexed db ([02b5442](https://github.com/keq-request/keq-cache/commit/02b54429856f4e343cd04d98cfb78a1d99e31249))

## [1.2.0](https://github.com/keq-request/keq-cache/compare/v1.1.0...v1.2.0) (2025-04-22)


### Features

* add exclude options used exlcude the response should not be cached ([4f6aa79](https://github.com/keq-request/keq-cache/commit/4f6aa793b4aa671695ee1e792dcf1de83b66b37b))


### Bug Fixes

* response is consumed abnormally ([3b6d204](https://github.com/keq-request/keq-cache/commit/3b6d204f94982219e27f751b162396bd1ff27548))

## [1.1.0](https://github.com/keq-request/keq-cache/compare/v1.0.6...v1.1.0) (2025-04-18)


### Features

* add onNetworkResponse event ([d9b94d0](https://github.com/keq-request/keq-cache/commit/d9b94d0e5d3dd172d48c8228ba51ad32d1eeee41))

## [1.0.6](https://github.com/keq-request/keq-cache/compare/v1.0.5...v1.0.6) (2025-04-16)


### Bug Fixes

* cannot find idb package ([b33e267](https://github.com/keq-request/keq-cache/commit/b33e267b7eb845e9e78c2ccb5d2a33db0ee7973a))

## [1.0.5](https://github.com/keq-request/keq-cache/compare/v1.0.4...v1.0.5) (2025-04-16)


### Bug Fixes

* cannot find idb package ([031f453](https://github.com/keq-request/keq-cache/commit/031f45358713cff0fe95a13613c2bf8b72fcb5c8))

## [1.0.4](https://github.com/keq-request/keq-cache/compare/v1.0.3...v1.0.4) (2024-11-25)


### Bug Fixes

* indexed-db not work ([187ed1f](https://github.com/keq-request/keq-cache/commit/187ed1ff399ca681a683c2b4d615963aced202b8))

## [1.0.3](https://github.com/keq-request/keq-cache/compare/v1.0.2...v1.0.3) (2024-11-19)


### Bug Fixes

* update import statements to include file extensions for esm ([f7118ee](https://github.com/keq-request/keq-cache/commit/f7118eeb2913ce48dc2bc53c99b831d52ecb8098))

## [1.0.2](https://github.com/keq-request/keq-cache/compare/v1.0.1...v1.0.2) (2024-11-19)


### Bug Fixes

* update import statements to include file extensions for esm ([49ed02f](https://github.com/keq-request/keq-cache/commit/49ed02f64e15f14a04c8f54281b913545db97af2))

## 1.0.1 (2024-11-18)


### Bug Fixes

* ctx.options.cache not working ([4f327eb](https://github.com/keq-request/keq-cache/commit/4f327eb887698b51cb44ebe4742f9e79a94fa30d))
* update cache strategy handling to enforce required strategy option ([7798327](https://github.com/keq-request/keq-cache/commit/77983270544286046ab47df11b39c054fa84164e))


### Miscellaneous Chores

* release 1.0.1 ([6dcfd9d](https://github.com/keq-request/keq-cache/commit/6dcfd9d94ad82f0726d5c4031291ece719bd766c))
