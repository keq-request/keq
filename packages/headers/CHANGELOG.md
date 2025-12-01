# Changelog

## 5.0.0-alpha.12

### Patch Changes

- 581815a: ensure compatibility
- Updated dependencies [581815a]
  - keq@5.0.0-alpha.12

## 5.0.0-alpha.11

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

### Patch Changes

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

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.4](https://github.com/keq-request/keq-headers/compare/v2.0.3...v2.0.4) (2024-05-21)

### Bug Fixes

- setHeaders should override but not ([fd0bc52](https://github.com/keq-request/keq-headers/commit/fd0bc52c995efcc21a33461aa862b0b8db87efe3))

## [2.0.3](https://github.com/keq-request/keq-headers/compare/v2.0.2...v2.0.3) (2024-05-13)

### Bug Fixes

- setHeaders/appendHeaders causing multiple requests to be sent ([1dba50a](https://github.com/keq-request/keq-headers/commit/1dba50a9dc29cc4e505a648ca8d2f24b731580aa))

### Performance Improvements

- add middleware function name ([4c4b411](https://github.com/keq-request/keq-headers/commit/4c4b4112047e7fc85a146461b7d49acdd1de4f17))

### [2.0.2](https://www.github.com/keq-request/keq-headers/compare/v2.0.1...v2.0.2) (2024-05-09)

### Bug Fixes

- insertHeader/insertHeaders cannot insert header ([e0efea4](https://www.github.com/keq-request/keq-headers/commit/e0efea422b4daed19958bbf042f29a8eddd184d5))

### [2.0.1](https://www.github.com/keq-request/keq-headers/compare/v2.0.0...v2.0.1) (2023-10-30)

### Bug Fixes

- missing peer deps ([90d6151](https://www.github.com/keq-request/keq-headers/commit/90d61512438c8eaf92ef9167af91724b11cbf022))
- wrong deps ([49a197d](https://www.github.com/keq-request/keq-headers/commit/49a197d77f632c9ce1bb46ab0f9778517e2372e0))

## [2.0.0](https://www.github.com/keq-request/keq-headers/compare/v1.0.1...v2.0.0) (2023-10-30)

### ⚠ BREAKING CHANGES

- drop support keq@1

### Features

- support keq@2 ([0731cd5](https://www.github.com/keq-request/keq-headers/commit/0731cd543ecc9a2fe7b7e80d6022582584b62c53))

### [1.0.1](https://www.github.com/keq-request/keq-headers/compare/v1.0.0...v1.0.1) (2021-07-09)

### Bug Fixes

- cannot insert header ([ec6800e](https://www.github.com/keq-request/keq-headers/commit/ec6800ef33c0e2c18705cf56c53e490617b86d10))

## 1.0.0 (2021-04-26)
