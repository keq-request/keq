# Changelog

## 5.0.0-beta.10

### Patch Changes

- Updated dependencies [95908fd]
  - keq@5.0.0-beta.10

## 5.0.0-beta.9

### Patch Changes

- keq@5.0.0-beta.9

## 5.0.0-beta.8

### Minor Changes

- a183653: **Feat:** add clarifyFetchFailed middleware.

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

### Major Changes

- 214ae66: **BREAKING CHANGE:** RequestException third parameter changed from retry: boolean to options: { fatal: boolean, response: Response }

  ```javascript
  // Before
  new RequestException(400, "Error message", true);

  // After
  new RequestException(400, "Error message", {
    fatal: false,
    response: someResponseObject,
  });
  ```

- 5175097: **BREAKING CHANGE:** group all packages under the @keq-request scope

  - keq-cache => @keq-request/cache
  - keq-headers => @keq-request/headers
  - keq-cli => @keq-request/cli
  - keq-url => @keq-request/url
  - keq-exception => @keq-request/exception

- 153244f: **BREAKING CHANGE:** move `RequestException` form `@keq-request/exception` to `keq`
- 0a04864: **Fix:** fix: update browser targets to chrome91/firefox90/safari15/edge91 to resolve esbuild 0.27 destructuring build errors.

### Minor Changes

- 74803c8: export `createExceptionByStatusCode` to create HTTP exceptions from a `Response` object
- 241a2ca: **Feat:** add a validateStatusCode middleware and plugin use to validate http response and throw standard exception

### Patch Changes

- b36df33: ValidateStatusCode plugin generate wrong code
- 2686b8d: build with turbo
- 2686b8d: remove private dependencies
- e7eb9dc: Don't publish .turbo and jest.config.cts to npm
- 0873c7e: Incorrect build before release.
- 153244f: remove override `retryOn`.
- 30b0848: rename validateResponse to validateStatusCode
- 581815a: ensure compatibility
- 7343445: Incorrect build before release
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

### Major Changes

- 0a04864: **Fix:** fix: update browser targets to chrome91/firefox90/safari15/edge91 to resolve esbuild 0.27 destructuring build errors.

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

### Minor Changes

- 74803c8: export `createExceptionByStatusCode` to create HTTP exceptions from a `Response` object

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

### Major Changes

- 214ae66: **BREAKING CHANGE:** RequestException third parameter changed from retry: boolean to options: { fatal: boolean, response: Response }

  ```javascript
  // Before
  new RequestException(400, "Error message", true);

  // After
  new RequestException(400, "Error message", {
    fatal: false,
    response: someResponseObject,
  });
  ```

### Patch Changes

- Updated dependencies [214ae66]
- Updated dependencies [9290139]
  - keq@5.0.0-alpha.25

## 5.0.0-alpha.24

### Patch Changes

- Updated dependencies [0a2eb2f]
  - keq@5.0.0-alpha.24

## 5.0.0-alpha.23

### Patch Changes

- Updated dependencies [842e555]
- Updated dependencies [7873a0a]
  - keq@5.0.0-alpha.23

## 5.0.0-alpha.22

### Patch Changes

- Updated dependencies [df114d1]
  - keq@5.0.0-alpha.22

## 5.0.0-alpha.21

### Patch Changes

- b36df33: ValidateStatusCode plugin generate wrong code
- Updated dependencies [90311b3]
  - keq@5.0.0-alpha.21

## 5.0.0-alpha.20

### Patch Changes

- Updated dependencies [1f367c0]
  - keq@5.0.0-alpha.20

## 5.0.0-alpha.19

### Patch Changes

- 30b0848: rename validateResponse to validateStatusCode
  - keq@5.0.0-alpha.19

## 5.0.0-alpha.18

### Minor Changes

- 241a2ca: **Feat:** add a validateResponse middleware and plugin use to validate http response and throw standard exception

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

- 153244f: **BREAKING CHANGE:** move `RequestException` form `@keq-request/exception` to `keq`

### Patch Changes

- 153244f: remove override `retryOn`.
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

## [3.2.0](https://github.com/keq-request/keq-exception/compare/v3.1.4...v3.2.0) (2025-06-05)

### Features

- add type-fest dependency and update Promisable type usage in catchException and throwException ([7c3cc96](https://github.com/keq-request/keq-exception/commit/7c3cc96a149914afac090ada383010fa4482c311))

## [3.1.4](https://github.com/keq-request/keq-exception/compare/v3.1.3...v3.1.4) (2025-06-05)

### Bug Fixes

- update catchException handler to support async functions ([18dd4f2](https://github.com/keq-request/keq-exception/commit/18dd4f25201c9e8eaaa20782b94bc78906807262))

## [3.1.3](https://github.com/keq-request/keq-exception/compare/v3.1.2...v3.1.3) (2024-12-18)

### Bug Fixes

- update module exports to include file extensions for esm ([ba42c19](https://github.com/keq-request/keq-exception/commit/ba42c198fe75c2fdd8ad4b6325675fe7920cf45b))

## [3.1.2](https://github.com/keq-request/keq-exception/compare/v3.1.1...v3.1.2) (2024-10-15)

### Bug Fixes

- move jest-environment-jsdom to dev deps ([7b316de](https://github.com/keq-request/keq-exception/commit/7b316de1c7720d2f68fb7c63002a595e6cf93798))

## [3.1.1](https://github.com/keq-request/keq-exception/compare/v3.1.0...v3.1.1) (2024-10-15)

### Bug Fixes

- export esm module error ([aba0c00](https://github.com/keq-request/keq-exception/commit/aba0c00cc3f0918aa49df8ccfc312b890ee3efa1))

## [3.1.0](https://github.com/keq-request/keq-exception/compare/v3.0.0...v3.1.0) (2024-05-28)

### Features

- control whether to trigger retry ([decd756](https://github.com/keq-request/keq-exception/commit/decd756ff54697754ac1e9d9dad97300c824732d))

## [3.0.0](https://github.com/keq-request/keq-exception/compare/v2.1.2...v3.0.0) (2024-05-26)

### ⚠ BREAKING CHANGES

- throwException parameter changes

### Features

- throw error takes effect when retrying ([5ff1fb5](https://github.com/keq-request/keq-exception/commit/5ff1fb5b3ebca23e63111bb7ace9030da0d2d078))

## [2.1.2](https://github.com/keq-request/keq-exception/compare/v2.1.1...v2.1.2) (2024-05-13)

### Continuous Integration

- cannot publish ([3dd7c23](https://github.com/keq-request/keq-exception/commit/3dd7c23aaaa933c03ad8f4634ee888871028e88a))

## [2.1.1](https://github.com/keq-request/keq-exception/compare/v2.1.0...v2.1.1) (2024-05-13)

### Performance Improvements

- add middleware function name ([028a50a](https://github.com/keq-request/keq-exception/commit/028a50a54440b303ca1d5f928045ca2fed9bf368))

## [2.1.0](https://github.com/keq-request/keq-exception/compare/v2.0.0...v2.1.0) (2024-04-23)

### Features

- message never required for RequestException ([828f29e](https://github.com/keq-request/keq-exception/commit/828f29e8b2048536e1267f45f6380c384ca2afbe))
