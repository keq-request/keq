# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.8.8](https://www.github.com/keq-request/keq/compare/v1.8.7...v1.8.8) (2022-06-24)


### Bug Fixes

* not working when response include null ([e98ea2b](https://www.github.com/keq-request/keq/commit/e98ea2bb831b8e94f531342bb53e0bb1e313c44b))

### [1.8.7](https://www.github.com/keq-request/keq/compare/v1.8.6...v1.8.7) (2022-06-22)


### Bug Fixes

* wrong content-type when send request in browser ([a100a5d](https://www.github.com/keq-request/keq/commit/a100a5db42e0dc6a032badb75a715fad8d1c600a))

### [1.8.6](https://www.github.com/keq-request/keq/compare/v1.8.5...v1.8.6) (2022-05-26)


### Bug Fixes

* cannot send multiple files ([ec70e66](https://www.github.com/keq-request/keq/commit/ec70e6641b93888257cc69e0c6c426dced801117))

### [1.8.5](https://www.github.com/keq-request/keq/compare/v1.8.4...v1.8.5) (2022-05-01)


### Bug Fixes

* esm not work ([6d1cd16](https://www.github.com/keq-request/keq/commit/6d1cd16b99e177b419dc5f1083662c6fa956caf1))

### [1.8.4](https://www.github.com/keq-request/keq/compare/v1.8.3...v1.8.4) (2022-05-01)


### Bug Fixes

* global middleware is polluted ([1c00f0e](https://www.github.com/keq-request/keq/commit/1c00f0e3bc7ab5d661d9aa64c033cfb644d3b054))

### [1.8.3](https://www.github.com/keq-request/keq/compare/v1.8.2...v1.8.3) (2022-04-26)


### Bug Fixes

* cannot find node:stream ([3137cad](https://www.github.com/keq-request/keq/commit/3137cadf6cf2481adb4bd17d45739501354498ff))

### [1.8.2](https://www.github.com/keq-request/keq/compare/v1.8.1...v1.8.2) (2022-04-26)


### Bug Fixes

* cannot find keq main file ([41908fa](https://www.github.com/keq-request/keq/commit/41908fa47eeb8f54fc018d445c5ef85ffc5ca383))

### [1.8.1](https://www.github.com/keq-request/keq/compare/v1.8.0...v1.8.1) (2022-04-25)


### Bug Fixes

* cannot compile by vite ([2727867](https://www.github.com/keq-request/keq/commit/27278676f924428e2598b634577ed8b63a1e935b))
* wrong return of response.blob() ([ca5a5b5](https://www.github.com/keq-request/keq/commit/ca5a5b5bd64bdde6a476d7ce5e86b9833cd2a43b))

## [1.8.0](https://www.github.com/keq-request/keq/compare/v1.7.3...v1.8.0) (2022-03-22)


### Features

* support custom request instance ([2c05dec](https://www.github.com/keq-request/keq/commit/2c05dec6d779861112507b7365822ecff175dbc3))

### [1.7.3](https://www.github.com/keq-request/keq/compare/v1.7.2...v1.7.3) (2022-03-08)


### Bug Fixes

* unable to send formdate request with file ([a4ed415](https://www.github.com/keq-request/keq/commit/a4ed41560aacb67a49d8159b453ddf69bce56799))

### [1.7.2](https://www.github.com/keq-request/keq/compare/v1.7.1...v1.7.2) (2022-02-25)


### Bug Fixes

* calling response.json() in middleware will cause garbled chinese characters ([40ffe02](https://www.github.com/keq-request/keq/commit/40ffe0238628c106a06eafe349e6d33b856fbf8f))
* throw error when not set url origin ([9040396](https://www.github.com/keq-request/keq/commit/9040396ba23edc1642abf27a203b39efe53fb130))

### [1.7.1](https://www.github.com/keq-request/keq/compare/v1.7.0...v1.7.1) (2022-02-24)


### Bug Fixes

* cannot import URL from url package ([b89721e](https://www.github.com/keq-request/keq/commit/b89721ed4c865ff570e32653b76a884cbc6a8db6))
* esm parse failed ([b95a97c](https://www.github.com/keq-request/keq/commit/b95a97c35ebf06a4c938e09312ec88fc1c9b9050))

## [1.7.0](https://www.github.com/keq-request/keq/compare/v1.6.6...v1.7.0) (2022-01-17)


### Features

* support keq-cli@2.x ([6a3db36](https://www.github.com/keq-request/keq/commit/6a3db3633c75dd8d801748867666261d603f2dfb))


### Performance Improvements

* ctx.request.url extends from whatwg url api ([96dd049](https://www.github.com/keq-request/keq/commit/96dd049ae79d657dd4d03f1472d434aebd27aca3))

### [1.6.6](https://www.github.com/keq-request/keq/compare/v1.6.5...v1.6.6) (2021-12-13)


### Bug Fixes

* response cannot call .text, .json, .formData and .blob together ([fa1605a](https://www.github.com/keq-request/keq/commit/fa1605a911b05ac7ce3ecdb9f6d7805b4ced36f2))

### [1.6.5](https://www.github.com/keq-request/keq/compare/v1.6.4...v1.6.5) (2021-12-13)


### Bug Fixes

* iterator cannot be looped ([022ca72](https://www.github.com/keq-request/keq/commit/022ca72f88788980207bcb36114138ef292230cd))

### [1.6.4](https://www.github.com/keq-request/keq/compare/v1.6.3...v1.6.4) (2021-12-13)


### Bug Fixes

* the default array formatting of query is nonstandard ([229e08c](https://www.github.com/keq-request/keq/commit/229e08c79881fd332784b7f1c3207c410f985f89))

### [1.6.3](https://www.github.com/keq-request/keq/compare/v1.6.2...v1.6.3) (2021-12-07)


### Bug Fixes

* cannot invoke .blob() on the proxy response ([4e21c90](https://www.github.com/keq-request/keq/commit/4e21c90e47c8e84dfb3637e9aab5c8dd63a6e43f))

### [1.6.2](https://www.github.com/keq-request/keq/compare/v1.6.1...v1.6.2) (2021-11-30)


### Bug Fixes

* cannot parse response.body when response.status is 204 ([1b7e88d](https://www.github.com/keq-request/keq/commit/1b7e88d4112931298649086ca1aaa572a5665422)), closes [#21](https://www.github.com/keq-request/keq/issues/21)

### [1.6.1](https://www.github.com/keq-request/keq/compare/v1.6.0...v1.6.1) (2021-11-26)


### Bug Fixes

* retryCallback interface ([aa25c99](https://www.github.com/keq-request/keq/commit/aa25c992c5fd1bb21882699b6ce9b3c8b038adcc))

## [1.6.0](https://www.github.com/keq-request/keq/compare/v1.5.0...v1.6.0) (2021-11-26)


### Features

* can stop retry ([527678f](https://www.github.com/keq-request/keq/commit/527678f85202a84deb030c0337a92e5f1db7f19a))

## [1.5.0](https://www.github.com/keq-request/keq/compare/v1.4.0...v1.5.0) (2021-11-26)


### Features

* add intial retry time option ([accb899](https://www.github.com/keq-request/keq/commit/accb899dbe3c96d7279e8ea4126554d5e940331f))

## [1.4.0](https://www.github.com/keq-request/keq/compare/v1.3.1...v1.4.0) (2021-10-16)


### Features

* add redirect option ([55931ce](https://www.github.com/keq-request/keq/commit/55931ce10bd02cb07e49240e2d3940297547e850)), closes [#14](https://www.github.com/keq-request/keq/issues/14)

### [1.3.1](https://www.github.com/keq-request/keq/compare/v1.3.0...v1.3.1) (2021-10-16)


### Bug Fixes

* cannot get middleware matcher interface ([e285b73](https://www.github.com/keq-request/keq/commit/e285b7391238194a652e2bdbf0f1a9d8174be83c))

## [1.3.0](https://www.github.com/keq-request/keq/compare/v1.2.2...v1.3.0) (2021-08-29)


### Features

* add an error message that the routing parameters cannot be resolved ([ea267cb](https://www.github.com/keq-request/keq/commit/ea267cbfb6f15306adf730e9ab61fd1ed4cfc3e9))

### [1.2.2](https://www.github.com/keq-request/keq/compare/v1.2.1...v1.2.2) (2021-05-09)


### Bug Fixes

* response.clone is not responding ([ef1d66c](https://www.github.com/keq-request/keq/commit/ef1d66ce1cde8fefc9753be8f46b550785231e31))

### [1.2.1](https://github.com/Val-istar-Guo/keq/compare/v1.2.0...v1.2.1) (2021-05-06)


### Bug Fixes

* cannot find mount.module ([2031351](https://github.com/Val-istar-Guo/keq/commit/203135174904f0e4c23c1988021e5502fb018b07))

## [1.2.0](https://github.com/Val-istar-Guo/keq/compare/v1.1.4...v1.2.0) (2021-05-05)


### Features

* add module mounter ([c9727b4](https://github.com/Val-istar-Guo/keq/commit/c9727b41332f01ed212d6119e7f2fe0b4d524d37))

### [1.1.4](https://github.com/Val-istar-Guo/keq/compare/v1.1.3...v1.1.4) (2021-04-26)


### Bug Fixes

* type error when set option resolveWithFullResponse ([b32dc20](https://github.com/Val-istar-Guo/keq/commit/b32dc20802df7effd5ad619237378f30632ac539))

### [1.1.3](https://github.com/Val-istar-Guo/keq/compare/v1.1.2...v1.1.3) (2021-04-21)

### [1.1.2](https://github.com/Val-istar-Guo/keq/compare/v1.1.1...v1.1.2) (2021-04-06)


### Bug Fixes

* cannot run in browser ([56c08b9](https://github.com/Val-istar-Guo/keq/commit/56c08b9e7b110ea86316d190f1eae11154b79248))
* throw undefined when response body is empty ([1904392](https://github.com/Val-istar-Guo/keq/commit/19043922946dde6165fd45008766e8a2a8c9fd83))

### [1.1.1](https://github.com/Val-istar-Guo/keq/compare/v1.1.0...v1.1.1) (2021-04-06)


### Bug Fixes

* missing export mount ([a097b15](https://github.com/Val-istar-Guo/keq/commit/a097b1539e65f48c1f4e8a1b35cf406560e588ca))

## [1.1.0](https://github.com/Val-istar-Guo/keq/compare/v1.0.1...v1.1.0) (2021-04-04)


### Features

* middleware mount utils ([fa35ff0](https://github.com/Val-istar-Guo/keq/commit/fa35ff0944e63fe313d09f74ef8c4ab4027265b6)), closes [#5](https://github.com/Val-istar-Guo/keq/issues/5)

### [1.0.1](https://github.com/Val-istar-Guo/keq/compare/v1.0.0...v1.0.1) (2021-02-24)

## [1.0.0](https://github.com/Val-istar-Guo/keq/compare/v0.0.11...v1.0.0) (2021-02-23)


### Features

* routing parameters ([4506df1](https://github.com/Val-istar-Guo/keq/commit/4506df1f1f3f8b102e0611b9e073402edd84d711))

### [0.0.11](https://github.com/Val-istar-Guo/keq/compare/v0.0.10...v0.0.11) (2020-12-30)


### Bug Fixes

* filename is missing ([347d427](https://github.com/Val-istar-Guo/keq/commit/347d4274b4ab9db1e3c2221af120e1c5a13b5b72))

### [0.0.10](https://github.com/Val-istar-Guo/keq/compare/v0.0.9...v0.0.10) (2020-12-30)


### Bug Fixes

* cannot send big file by form-data ([d25218a](https://github.com/Val-istar-Guo/keq/commit/d25218a59d5fbaa3d857764b6539ed8056ff3e5a))

### [0.0.9](https://github.com/Val-istar-Guo/keq/compare/v0.0.8...v0.0.9) (2020-12-29)


### Features

* add new option resolveWithOriginalResponse ([158d32d](https://github.com/Val-istar-Guo/keq/commit/158d32d66ed64fc213bb254c8214bd6d0b15b80f))

### [0.0.8](https://github.com/Val-istar-Guo/keq/compare/v0.0.7...v0.0.8) (2020-11-20)


### Features

* support highWaterMark ([85c77ff](https://github.com/Val-istar-Guo/keq/commit/85c77ff0cb74fd90ad0c3e67dbe5d94d7f314863))


### Bug Fixes

* middleware cannot modified resolveWithFullResponse ([329b766](https://github.com/Val-istar-Guo/keq/commit/329b766c79b945185412f7b3fc13d320f7452f00))

### [0.0.7](https://github.com/Val-istar-Guo/keq/compare/v0.0.6...v0.0.7) (2020-11-20)


### Bug Fixes

* don't set content-type when no request body ([291bb65](https://github.com/Val-istar-Guo/keq/commit/291bb65854ba2c70c11c367187c9021962d66ee3))

### [0.0.6](https://github.com/Val-istar-Guo/keq/compare/v0.0.5...v0.0.6) (2020-11-13)

### [0.0.5](https://github.com/Val-istar-Guo/keq/compare/v0.0.4...v0.0.5) (2020-10-18)


### Bug Fixes

* cannot proxy polyfill response ([74e26d2](https://github.com/Val-istar-Guo/keq/commit/74e26d2f039e947ebf94b2472a9fc7db1c49ee43)), closes [#3](https://github.com/Val-istar-Guo/keq/issues/3)

### [0.0.4](https://github.com/Val-istar-Guo/keq/compare/v0.0.3...v0.0.4) (2020-07-16)


### Bug Fixes

* x-ww-form-urlencoded not support array ([4f88e22](https://github.com/Val-istar-Guo/keq/commit/4f88e220b19e8a161020abafff9adfdb951d2bfb)), closes [#1](https://github.com/Val-istar-Guo/keq/issues/1)

### [0.0.3](https://github.com/Val-istar-Guo/keq/compare/v0.0.2...v0.0.3) (2020-05-30)


### Bug Fixes

* cannot find fs ([bf52f11](https://github.com/Val-istar-Guo/keq/commit/bf52f11cb337bce92898eff645f2bd41599a4c24))
* dependence missing ([73f3409](https://github.com/Val-istar-Guo/keq/commit/73f3409922da2a5609a4cd3bcb38624e1c4c1d24))
* throw error when set undefined to query value ([5fb94a6](https://github.com/Val-istar-Guo/keq/commit/5fb94a667b46d01e3547e4d07424028a5bcc4dea))

### [0.0.2](https://github.com/Val-istar-Guo/keq/compare/v0.0.1...v0.0.2) (2020-04-17)

### 0.0.1 (2020-03-01)
