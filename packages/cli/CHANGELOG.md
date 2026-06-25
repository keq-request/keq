# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.10.12](https://github.com/keq-request/keq-cli/compare/v4.10.11...v4.10.12) (2025-09-10)


### Bug Fixes

* cannot generete schema named index ([9c0c841](https://github.com/keq-request/keq-cli/commit/9c0c84196158e056c35132824da5b5da6e025fc7))

## [4.10.11](https://github.com/keq-request/keq-cli/compare/v4.10.10...v4.10.11) (2025-09-02)


### Performance Improvements

* update generated comments in templates to prevent editing ([6cb6069](https://github.com/keq-request/keq-cli/commit/6cb606924fd895a0a954cb3d32ce7d50db1f6847))

## [4.10.10](https://github.com/keq-request/keq-cli/compare/v4.10.9...v4.10.10) (2025-08-14)


### Performance Improvements

* add option to tolerate wrong swagger ([1399ec7](https://github.com/keq-request/keq-cli/commit/1399ec7cea9e82a926375554bd3189fe295b51c2))

## [4.10.9](https://github.com/keq-request/keq-cli/compare/v4.10.8...v4.10.9) (2025-08-06)


### Bug Fixes

* escape asterisks in comment template ([c02a76b](https://github.com/keq-request/keq-cli/commit/c02a76bdbf80f5883a959f305a5e2d5ad8a488f9))
* wrong import paths ([5648e02](https://github.com/keq-request/keq-cli/commit/5648e02fc60eb39281fb0bdb1b7437e133df6920))

## [4.10.8](https://github.com/keq-request/keq-cli/compare/v4.10.7...v4.10.8) (2025-06-13)


### Bug Fixes

* undefined should not set into form-data ([4ebc9fe](https://github.com/keq-request/keq-cli/commit/4ebc9fe425ef5ab221d8b1da3880eeb9a19437b8))

## [4.10.7](https://github.com/keq-request/keq-cli/compare/v4.10.6...v4.10.7) (2025-03-28)


### Bug Fixes

* wrong typescript types with binary property ([ccad920](https://github.com/keq-request/keq-cli/commit/ccad92056f5902176b76f74899a0151304f55172))

## [4.10.6](https://github.com/keq-request/keq-cli/compare/v4.10.5...v4.10.6) (2025-03-28)


### Bug Fixes

* wrong code with binary file ([d432c43](https://github.com/keq-request/keq-cli/commit/d432c43c2459990129f2de732efebb36d894b148))

## [4.10.5](https://github.com/keq-request/keq-cli/compare/v4.10.4...v4.10.5) (2025-03-21)


### Bug Fixes

* wrong form data renderer ([869935d](https://github.com/keq-request/keq-cli/commit/869935d4be1e631c10f25e6cd30f2bf27b58a833))

## [4.10.4](https://github.com/keq-request/keq-cli/compare/v4.10.3...v4.10.4) (2025-03-06)


### Bug Fixes

* ensure header parameters are set only if they have a value ([0cd82a6](https://github.com/keq-request/keq-cli/commit/0cd82a648f0ac248cb069c76c1415b2c050c0ca4))

## [4.10.3](https://github.com/keq-request/keq-cli/compare/v4.10.2...v4.10.3) (2025-02-12)


### Performance Improvements

* use @opendoc/openapi-shaking to simplify code ([c5b55d5](https://github.com/keq-request/keq-cli/commit/c5b55d5a3d390df96c07b97a0bed1c9f263d2647))

## [4.10.2](https://github.com/keq-request/keq-cli/compare/v4.10.1...v4.10.2) (2025-01-21)


### Bug Fixes

* cli --pathname and --method not work without -i ([3ee73e9](https://github.com/keq-request/keq-cli/commit/3ee73e90e1e7fde3e3d1aad1544021657d0044d4))


### Performance Improvements

* sharking unsupported methods ([efce73a](https://github.com/keq-request/keq-cli/commit/efce73ae3e67fc3cda5379c78c383af9458ffd5f))

## [4.10.1](https://github.com/keq-request/keq-cli/compare/v4.10.0...v4.10.1) (2025-01-21)


### Bug Fixes

* cli filters not work ([dd41863](https://github.com/keq-request/keq-cli/commit/dd4186325c0960abe65ada4fcf937732498af95b))

## [4.10.0](https://github.com/keq-request/keq-cli/compare/v4.9.2...v4.10.0) (2025-01-20)


### Features

* cli could accept arrays for method and pathname ([db872e5](https://github.com/keq-request/keq-cli/commit/db872e53da2b388af69538b2d3fd5b65cbddb555))


### Performance Improvements

* cli method option case insensitive ([93c8095](https://github.com/keq-request/keq-cli/commit/93c8095d1ae80a77e2ef519f378f344eb216b550))

## [4.9.2](https://github.com/keq-request/keq-cli/compare/v4.9.1...v4.9.2) (2025-01-14)


### Bug Fixes

* effective schema be removed ([c273da3](https://github.com/keq-request/keq-cli/commit/c273da38ad51b6ebe1f011ebb04a43c4cc10ea36))

## [4.9.1](https://github.com/keq-request/keq-cli/compare/v4.9.0...v4.9.1) (2025-01-09)


### Performance Improvements

* do not valid opeartion that be sharked ([914cdbc](https://github.com/keq-request/keq-cli/commit/914cdbcbbee78ab4df947f9e14ea3d490c32a835))

## [4.9.0](https://github.com/keq-request/keq-cli/compare/v4.8.1...v4.9.0) (2024-12-23)


### Features

* you could get pathname form &lt;operation&gt;.pathname ([4cc4218](https://github.com/keq-request/keq-cli/commit/4cc4218f9893f86a986481dbf9d20c5b130ea45a))


### Performance Improvements

* beautify the error message when fetch wrong swagger url ([2295cdf](https://github.com/keq-request/keq-cli/commit/2295cdf15cf62b486b1f5819f0a0f9cf6e31dc03))
* export operation types ([989c338](https://github.com/keq-request/keq-cli/commit/989c338730782707f830ad01fa0fc85d30e23f28))
* unified quotation mark style ([dcf3bb3](https://github.com/keq-request/keq-cli/commit/dcf3bb32d026a44e7125f62a498c6a5066ef7063))

## [4.8.1](https://github.com/keq-request/keq-cli/compare/v4.8.0...v4.8.1) (2024-12-18)


### Performance Improvements

* support summary in comments ([59320e0](https://github.com/keq-request/keq-cli/commit/59320e0bdd78342b3c2402916ceb04d2c1b9cbdb))

## [4.8.0](https://github.com/keq-request/keq-cli/compare/v4.7.10...v4.8.0) (2024-12-15)


### Features

* support form-data ([35da404](https://github.com/keq-request/keq-cli/commit/35da40438d8284143fd7407d6eda2f1cc91b6bdc)), closes [#102](https://github.com/keq-request/keq-cli/issues/102)


### Bug Fixes

* [#102](https://github.com/keq-request/keq-cli/issues/102) ([35da404](https://github.com/keq-request/keq-cli/commit/35da40438d8284143fd7407d6eda2f1cc91b6bdc))

## [4.7.10](https://github.com/keq-request/keq-cli/compare/v4.7.9...v4.7.10) (2024-12-10)


### Bug Fixes

* update peer dependency keq to version 2.7.4 ([fab64c8](https://github.com/keq-request/keq-cli/commit/fab64c8472db307035d4c105b771193a22a7f147))

## [4.7.9](https://github.com/keq-request/keq-cli/compare/v4.7.8...v4.7.9) (2024-12-03)


### Bug Fixes

* generation error when allOf and properties are present at the same time ([d51b39e](https://github.com/keq-request/keq-cli/commit/d51b39ec362a189a7c35601649e3caf83cb9b6e5))

## [4.7.8](https://github.com/keq-request/keq-cli/compare/v4.7.7...v4.7.8) (2024-11-29)


### Performance Improvements

* explicit error messages when cannot find schema ([0a35364](https://github.com/keq-request/keq-cli/commit/0a35364a452a6ad3471738cb9efe6b8677c1be87))

## [4.7.7](https://github.com/keq-request/keq-cli/compare/v4.7.6...v4.7.7) (2024-10-23)


### Performance Improvements

* use operationIdFactory replace operationId ([ed1d8d3](https://github.com/keq-request/keq-cli/commit/ed1d8d34eda4b5b3e1acec693c3c1149fbb680e9))

## [4.7.6](https://github.com/keq-request/keq-cli/compare/v4.7.5...v4.7.6) (2024-09-27)


### Bug Fixes

* avoid Chinese characters being replaced by random numbers ([9108908](https://github.com/keq-request/keq-cli/commit/91089080e6379dd43fbc150483165857eb0c10a0))

## [4.7.5](https://github.com/keq-request/keq-cli/compare/v4.7.4...v4.7.5) (2024-09-25)


### Bug Fixes

* special characters cause Chinese replacement to fail ([08ec464](https://github.com/keq-request/keq-cli/commit/08ec464d63adb74ead9b1a233325e7a3b0e674be))

## [4.7.4](https://github.com/keq-request/keq-cli/compare/v4.7.3...v4.7.4) (2024-09-04)


### Bug Fixes

* --debug not work ([dda42cc](https://github.com/keq-request/keq-cli/commit/dda42ccf11d9a830c7eaac6794ef58179b2a6ca9))
* error when allof without $ref ([4339583](https://github.com/keq-request/keq-cli/commit/4339583bc07fa78f544f0610a39db312250e1723))

## [4.7.3](https://github.com/keq-request/keq-cli/compare/v4.7.2...v4.7.3) (2024-08-22)


### Bug Fixes

* prompts the wrong skip module ([3621e01](https://github.com/keq-request/keq-cli/commit/3621e0160293e5be4aa01c6ce7b3b43574b4eac8))

## [4.7.2](https://github.com/keq-request/keq-cli/compare/v4.7.1...v4.7.2) (2024-08-21)


### Performance Improvements

* add alert when not select any pathname in interactive mode ([743caba](https://github.com/keq-request/keq-cli/commit/743cabaa1809ae2ef125acbf40a63ad2408efe60))

## [4.7.1](https://github.com/keq-request/keq-cli/compare/v4.7.0...v4.7.1) (2024-08-19)


### Bug Fixes

* throw error when swagger has null property ([e556e1f](https://github.com/keq-request/keq-cli/commit/e556e1f7ca229dca1dd89896978cd5e07315b42f))

## [4.7.0](https://github.com/keq-request/keq-cli/compare/v4.6.4...v4.7.0) (2024-08-19)


### Features

* sharking unselected schemas ([f73b738](https://github.com/keq-request/keq-cli/commit/f73b7387bad6be362cf033f6de9270b7bc71d04b))


### Performance Improvements

* log the number of impacts after generated ([7d7da39](https://github.com/keq-request/keq-cli/commit/7d7da39a0c6c3ea730aed6f139fc99bf0fded026))

## [4.6.4](https://github.com/keq-request/keq-cli/compare/v4.6.3...v4.6.4) (2024-08-13)


### Bug Fixes

* the number type defined in header/routeParams/query is incorrectly compiled into string type ([d2ad9d1](https://github.com/keq-request/keq-cli/commit/d2ad9d17c6775fc31a3a4f18e1ea1b145526806c))

## [4.6.3](https://github.com/keq-request/keq-cli/compare/v4.6.2...v4.6.3) (2024-08-13)


### Performance Improvements

* allow header to add number type fields ([37ab442](https://github.com/keq-request/keq-cli/commit/37ab44235d01690b4e88971842ebc95866172ba1))

## [4.6.2](https://github.com/keq-request/keq-cli/compare/v4.6.1...v4.6.2) (2024-08-12)


### Performance Improvements

* prompt when no method is selected in interactive mode ([3adeb81](https://github.com/keq-request/keq-cli/commit/3adeb8118f720102ffab5b487646945e621dfae7))
* set default method in interactive mode ([3b9bf5b](https://github.com/keq-request/keq-cli/commit/3b9bf5b7390d5278fe609cc6c7d6ee22103d46fe))
* trim space in search ([1526d2a](https://github.com/keq-request/keq-cli/commit/1526d2af410ea59aa5ad891b3de18c38687e3f0b))

## [4.6.1](https://github.com/keq-request/keq-cli/compare/v4.6.0...v4.6.1) (2024-08-10)


### Bug Fixes

* requestBody,response and paramaters cannot be parsed correctly when $ref appears ([d2f5871](https://github.com/keq-request/keq-cli/commit/d2f587152ff22514c6ac364773bd4f08a5a6a079))

## [4.6.0](https://github.com/keq-request/keq-cli/compare/v4.5.7...v4.6.0) (2024-08-09)


### Features

* add interactive filter ([6908d2b](https://github.com/keq-request/keq-cli/commit/6908d2bc25bcf8a3388dc753e988347c066b4ca2))
* add operation filter ([772c614](https://github.com/keq-request/keq-cli/commit/772c6145f2e7bd1e2e84f82e110ad1a1f05b9176))

## [4.5.7](https://github.com/keq-request/keq-cli/compare/v4.5.6...v4.5.7) (2024-07-24)


### Bug Fixes

* wrong typescript definition ([bb2856e](https://github.com/keq-request/keq-cli/commit/bb2856e68ea84f22d54f61dffe197efaf0d8e8f9))

## [4.5.6](https://github.com/keq-request/keq-cli/compare/v4.5.5...v4.5.6) (2024-07-08)


### Bug Fixes

* build fails when there is a boolean attribute in the query ([ea4d06e](https://github.com/keq-request/keq-cli/commit/ea4d06ec13ec76f92e8bb9a1cf72e6511e6d893b))

## [4.5.5](https://github.com/keq-request/keq-cli/compare/v4.5.4...v4.5.5) (2024-06-26)


### Bug Fixes

* compilation error caused by trace and option interfaces in swagger file ([2032aae](https://github.com/keq-request/keq-cli/commit/2032aae9ff9bb21e8a2a8746c9a6447cf8598811))

## [4.5.4](https://github.com/keq-request/keq-cli/compare/v4.5.3...v4.5.4) (2024-06-21)


### Bug Fixes

* cli config option not work ([c991369](https://github.com/keq-request/keq-cli/commit/c991369bbfba4127a9b6d4f3e70bbef94b25df61))


### Performance Improvements

* check node version and lock typescript version ([3dbb509](https://github.com/keq-request/keq-cli/commit/3dbb50968846a3a117936cd4dfc1242e15a8bfa0))

## [4.5.3](https://github.com/keq-request/keq-cli/compare/v4.5.2...v4.5.3) (2024-06-07)


### Bug Fixes

* cannot import KeqOperation type ([578fd00](https://github.com/keq-request/keq-cli/commit/578fd00789c0957b6360cca5e969d9f4eacab899))

## [4.5.2](https://github.com/keq-request/keq-cli/compare/v4.5.1...v4.5.2) (2024-06-04)


### Bug Fixes

* esm option not work ([e527975](https://github.com/keq-request/keq-cli/commit/e5279754702960be834e574810c03d16fa9d82c9))

## [4.5.1](https://github.com/keq-request/keq-cli/compare/v4.5.0...v4.5.1) (2024-06-04)


### Bug Fixes

* add esm configuration to control the generated code to comply with esm specifications ([04fda6a](https://github.com/keq-request/keq-cli/commit/04fda6aa330f59d1ab3432b26f2c154dd51643a7))

## [4.5.0](https://github.com/keq-request/keq-cli/compare/v4.4.1...v4.5.0) (2024-06-02)


### Features

* support code hints for keq ([39f5810](https://github.com/keq-request/keq-cli/commit/39f5810239395f3f70a7456bd49dea930ba44ddc))


### Performance Improvements

* generate the ts definition file of the interface independently ([6c8b970](https://github.com/keq-request/keq-cli/commit/6c8b9708427edda5fa5f668f31e54c34cd9ef24b))

## [4.4.1](https://github.com/keq-request/keq-cli/compare/v4.4.0...v4.4.1) (2024-05-31)


### Bug Fixes

* swagger from remote url not fix and convert correctly ([48917b8](https://github.com/keq-request/keq-cli/commit/48917b81489b8b4aa46571e96f2e227581d233de))

## [4.4.0](https://github.com/keq-request/keq-cli/compare/v4.3.1...v4.4.0) (2024-05-30)


### Features

* support custom operationId ([ec2bfe5](https://github.com/keq-request/keq-cli/commit/ec2bfe5283a7af8d9acc557ad2e1661b30c392f2))

## [4.3.1](https://github.com/keq-request/keq-cli/compare/v4.3.0...v4.3.1) (2024-05-29)


### Bug Fixes

* update swagger-fix to 1.0.1 ([2a37482](https://github.com/keq-request/keq-cli/commit/2a37482296a3f74a007b9576498187def20a16d6))

## [4.3.0](https://github.com/keq-request/keq-cli/compare/v4.2.1...v4.3.0) (2024-05-29)


### Features

* fix invalid content in swagger using swagger-fix ([42ee607](https://github.com/keq-request/keq-cli/commit/42ee6078735675900ba63618637b3074160327a4))

## [4.2.1](https://github.com/keq-request/keq-cli/compare/v4.2.0...v4.2.1) (2024-05-16)


### Bug Fixes

* swagger@2 maybe outpu nothing ([10fc715](https://github.com/keq-request/keq-cli/commit/10fc715d354f78e9cb7b3a6db19cc8030376d779))

## [4.2.0](https://github.com/keq-request/keq-cli/compare/v4.1.3...v4.2.0) (2024-05-15)


### Features

* auto covert swagger@2 to swagger@3 ([391d13d](https://github.com/keq-request/keq-cli/commit/391d13d0e3e11f4d58665c98c403139dfdea367d))

## [4.1.3](https://github.com/keq-request/keq-cli/compare/v4.1.2...v4.1.3) (2024-05-14)


### Documentation

* ues keq@2 API as example ([ce981ac](https://github.com/keq-request/keq-cli/commit/ce981acea2041da735ab173515e9ba3d357c76d5))

## [4.1.2](https://github.com/keq-request/keq-cli/compare/v4.1.1...v4.1.2) (2024-05-13)


### Performance Improvements

* beautify operation code ([7441b41](https://github.com/keq-request/keq-cli/commit/7441b413cec6ff7668b4d499155ba7b74c67963b))

## [4.1.1](https://github.com/keq-request/keq-cli/compare/v4.1.0...v4.1.1) (2024-03-18)


### Bug Fixes

* middle line in the header will cause errors in the generated code ([acb0426](https://github.com/keq-request/keq-cli/commit/acb04265076e758534ccf0111f3c322d451fa61a))

## [4.1.0](https://github.com/keq-request/keq-cli/compare/v4.0.2...v4.1.0) (2024-03-14)


### Features

* support multiple status schema ([94c06e4](https://github.com/keq-request/keq-cli/commit/94c06e4340078830aac743cabdec3c462600b99b))

## [4.0.2](https://github.com/keq-request/keq-cli/compare/v4.0.1...v4.0.2) (2024-03-14)


### Bug Fixes

* hyphens in object keys will cause the generated interface exception ([e0e718e](https://github.com/keq-request/keq-cli/commit/e0e718ea9575a468e262ca8752003487a7bd9202))

## [4.0.1](https://github.com/keq-request/keq-cli/compare/v4.0.0...v4.0.1) (2024-01-22)


### Bug Fixes

* wrong peerDependencies ([623da11](https://github.com/keq-request/keq-cli/commit/623da11d8f5081ba4e45ac7f8a3df2106890c307))


### Performance Improvements

* human error message ([16874a3](https://github.com/keq-request/keq-cli/commit/16874a34d56bba4f747b20aba32439cc0ae02628))

## [4.0.0](https://github.com/keq-request/keq-cli/compare/v3.1.5...v4.0.0) (2024-01-19)


### ⚠ BREAKING CHANGES

* Drop support node@16 and keq@1

### Features

* update dependencies,docs and build tools ([45abafc](https://github.com/keq-request/keq-cli/commit/45abafc04d6c8e6dba5ee1d55177df03e7acad6c))


### Bug Fixes

* operation cannot be generated correctly when allOf/oneOf/anyOf exits in the request body ([c2ddb7f](https://github.com/keq-request/keq-cli/commit/c2ddb7fee555f30cb1e60c4acc7a05bd997ac14d))

### [3.1.5](https://www.github.com/keq-request/keq-cli/compare/v3.1.4...v3.1.5) (2023-02-08)


### Bug Fixes

* operation name unescaped all special characters ([a9a29c0](https://www.github.com/keq-request/keq-cli/commit/a9a29c0e364b8dcbdf71c4be362d27369c2896b8))

### [3.1.4](https://www.github.com/keq-request/keq-cli/compare/v3.1.3...v3.1.4) (2023-02-08)


### Bug Fixes

* avoid operation naming duplicates with javascript keywords ([c9ce69a](https://www.github.com/keq-request/keq-cli/commit/c9ce69a2cc1e937f8bf2fda676f77e2cbba6c3e7))
* the operation do not import schema of parameters ([7a4d265](https://www.github.com/keq-request/keq-cli/commit/7a4d265761b27ad638d39c71d964bc8882ca7495))

### [3.1.3](https://www.github.com/keq-request/keq-cli/compare/v3.1.2...v3.1.3) (2023-01-03)


### Bug Fixes

* support integer type ([c325428](https://www.github.com/keq-request/keq-cli/commit/c325428b05d6ff3456ad1a669cf2dcb2b9ce6c74))

### [3.1.2](https://www.github.com/keq-request/keq-cli/compare/v3.1.1...v3.1.2) (2022-12-29)


### Bug Fixes

* generate wrong operation when has multiple route params ([fc18ba0](https://www.github.com/keq-request/keq-cli/commit/fc18ba0ed070c2248cf2fa984a376a172ec47647))

### [3.1.1](https://www.github.com/keq-request/keq-cli/compare/v3.1.0...v3.1.1) (2022-12-16)


### Bug Fixes

* compile wrong when items is undefined ([6a4897d](https://www.github.com/keq-request/keq-cli/commit/6a4897d1541d0f61377a9a96ac3963779bbc7256))

## [3.1.0](https://www.github.com/keq-request/keq-cli/compare/v3.0.15...v3.1.0) (2022-12-14)


### Features

* beautify logging and avoid individual modules blocking other modules from compiling ([3e883b9](https://www.github.com/keq-request/keq-cli/commit/3e883b9d88fc9976cfe2de7d8115da62e07b7e7c))


### Bug Fixes

* import is lost when $ref is in additionalProperties ([31aedb6](https://www.github.com/keq-request/keq-cli/commit/31aedb6ef1d6fba83618f7d8d49d037407d878d7))
* the compiled index file wrong, when operationId is "index" ([e264f92](https://www.github.com/keq-request/keq-cli/commit/e264f929d6f877cd18fe339d48f209eec1faad8a))

### [3.0.15](https://www.github.com/keq-request/keq-cli/compare/v3.0.14...v3.0.15) (2022-10-14)


### Bug Fixes

* the wrong file is output when the swagger file contentType exists */* ([fdec6dc](https://www.github.com/keq-request/keq-cli/commit/fdec6dcad1863f9bd2fbab474c1d22d4dd4520b1))

### [3.0.14](https://www.github.com/keq-request/keq-cli/compare/v3.0.13...v3.0.14) (2022-10-13)


### Bug Fixes

* program chashed when swagger without parameters ([bbe6105](https://www.github.com/keq-request/keq-cli/commit/bbe61051b6d6360d57ae4162007e8f239474351c))

### [3.0.13](https://www.github.com/keq-request/keq-cli/compare/v3.0.12...v3.0.13) (2022-08-03)


### Bug Fixes

* wrong request instance when run build ([4f1809e](https://www.github.com/keq-request/keq-cli/commit/4f1809e9e2bbdf9ce9275efa942b9e239f0fa7bc))

### [3.0.12](https://www.github.com/keq-request/keq-cli/compare/v3.0.11...v3.0.12) (2022-08-03)


### Bug Fixes

* wrong default request instance ([313acea](https://www.github.com/keq-request/keq-cli/commit/313aceacb787ed5432153fdd89d7f7c70da4c00a))

### [3.0.11](https://www.github.com/keq-request/keq-cli/compare/v3.0.10...v3.0.11) (2022-07-23)


### Bug Fixes

* the wrong custom request instance path in generated file ([d92d2d9](https://www.github.com/keq-request/keq-cli/commit/d92d2d94fe3413c3a96fe09fdd88862e539da077))

### [3.0.10](https://www.github.com/keq-request/keq-cli/compare/v3.0.9...v3.0.10) (2022-06-19)


### Bug Fixes

* url template not transformed in module pathname ([4dcc092](https://www.github.com/keq-request/keq-cli/commit/4dcc092b120111cc19b1f710350feb3f69ef71a0))

### [3.0.9](https://www.github.com/keq-request/keq-cli/compare/v3.0.8...v3.0.9) (2022-06-19)


### Bug Fixes

* url template is not transformed automatically ([d7257cc](https://www.github.com/keq-request/keq-cli/commit/d7257ccc4e0cac758d34a8503b7e99b35cbf7325))

### [3.0.8](https://www.github.com/keq-request/keq-cli/compare/v3.0.7...v3.0.8) (2022-06-19)


### Bug Fixes

* the request body is not autofilled ([35e48e7](https://www.github.com/keq-request/keq-cli/commit/35e48e7e7496e723b1b2480698476110db7333b0))

### [3.0.7](https://www.github.com/keq-request/keq-cli/compare/v3.0.6...v3.0.7) (2022-06-16)


### Bug Fixes

* export unnecessary type declarations ([5d36b87](https://www.github.com/keq-request/keq-cli/commit/5d36b87e68e5c281a8fbd04ddc1f3eda6d3edb0c))
* schema dependencies are deduplicated ([7a6df88](https://www.github.com/keq-request/keq-cli/commit/7a6df88d0f741af3a18ad6672aef235c5822ab35))

### [3.0.6](https://www.github.com/keq-request/keq-cli/compare/v3.0.5...v3.0.6) (2022-06-15)


### Bug Fixes

* missing export file ([e8d9ef0](https://www.github.com/keq-request/keq-cli/commit/e8d9ef0861a357a85e95a98f49addd3f9200ab64))

### [3.0.5](https://www.github.com/keq-request/keq-cli/compare/v3.0.4...v3.0.5) (2022-06-15)


### Bug Fixes

* error generated by recursive interface ([c23318f](https://www.github.com/keq-request/keq-cli/commit/c23318fe059765f8402a174ebe531a7aaec1568a))
* missing return type of operation ([43b0e81](https://www.github.com/keq-request/keq-cli/commit/43b0e81f40088d67db0e25cf1778545e9df9a118))
* query args compatible in operation ([084884f](https://www.github.com/keq-request/keq-cli/commit/084884f7035cde7869caa93d99d5ed592d583e20))
* return type declaration error when multiple return values ([516284a](https://www.github.com/keq-request/keq-cli/commit/516284a388f27b3a3fdd9cd4a3a9a77747e4373e))


### Performance Improvements

* reduce file write times ([1f28a75](https://www.github.com/keq-request/keq-cli/commit/1f28a75d133e995bd271ee8e7cb5303db47a1ace))

### [3.0.4](https://www.github.com/keq-request/keq-cli/compare/v3.0.3...v3.0.4) (2022-06-14)


### Bug Fixes

* cannot find hbs files ([3c1210b](https://www.github.com/keq-request/keq-cli/commit/3c1210bdd87d9d8da3298d9537394cd7a524835c))

### [3.0.3](https://www.github.com/keq-request/keq-cli/compare/v3.0.2...v3.0.3) (2022-06-14)


### Bug Fixes

* missing dependencies: @apidevtools/swagger-parser ([a195cf9](https://www.github.com/keq-request/keq-cli/commit/a195cf9a46e8bc99424ef7b8f5c4893d3d99222c))

### [3.0.2](https://www.github.com/keq-request/keq-cli/compare/v3.0.1...v3.0.2) (2022-06-14)


### Bug Fixes

* remove husky from postinstall ([6f730f4](https://www.github.com/keq-request/keq-cli/commit/6f730f41edb54bfb22a8e3b48c9d54c187236331))

### [3.0.1](https://www.github.com/keq-request/keq-cli/compare/v3.0.0...v3.0.1) (2022-06-14)


### Bug Fixes

* cannot find command ([d597bdb](https://www.github.com/keq-request/keq-cli/commit/d597bdbbd74a7be89a23b70150a5204df4dcff1b))

## [3.0.0](https://www.github.com/keq-request/keq-cli/compare/v2.5.0...v3.0.0) (2022-06-14)


### ⚠ BREAKING CHANGES

* never support env setting

### Code Refactoring

* replace mustache with handlebars ([a1b381b](https://www.github.com/keq-request/keq-cli/commit/a1b381b454546197cab9e3fad9333ce7b30769d7))

## [2.5.0](https://www.github.com/keq-request/keq-cli/compare/v2.4.0...v2.5.0) (2022-05-10)


### Features

* support nullable ([62cf7f6](https://www.github.com/keq-request/keq-cli/commit/62cf7f667638bcb149c57b804c63cdf5a7469602))

## [2.4.0](https://www.github.com/keq-request/keq-cli/compare/v2.3.3...v2.4.0) (2022-04-23)


### Features

* remove unnecessary env definition ([384fee7](https://www.github.com/keq-request/keq-cli/commit/384fee7fc4a900ac79e5b337b01e3f0d8998d4be))

### [2.3.3](https://www.github.com/keq-request/keq-cli/compare/v2.3.2...v2.3.3) (2022-04-15)


### Bug Fixes

* additional properties generate wrong ts interface ([a6bf3a8](https://www.github.com/keq-request/keq-cli/commit/a6bf3a88e55b45a6bab8d5e5205cea48d6fc3e2a))

### [2.3.2](https://www.github.com/keq-request/keq-cli/compare/v2.3.1...v2.3.2) (2022-04-13)


### Bug Fixes

* the type error in compile result ([b044ec5](https://www.github.com/keq-request/keq-cli/commit/b044ec506f4aac48dcdb51a8d143d27821d9babe))

### [2.3.1](https://www.github.com/keq-request/keq-cli/compare/v2.3.0...v2.3.1) (2022-04-13)


### Bug Fixes

* envName option not work ([727c030](https://www.github.com/keq-request/keq-cli/commit/727c0303f318adf50106fab563f867f2e207ce15))

## [2.3.0](https://www.github.com/keq-request/keq-cli/compare/v2.2.0...v2.3.0) (2022-04-13)


### Features

* enable change the request instance and set environment vairable ([3c2cf96](https://www.github.com/keq-request/keq-cli/commit/3c2cf960231865b15dcc5947061366a06beb5ffc))

## [2.2.0](https://www.github.com/keq-request/keq-cli/compare/v2.1.2...v2.2.0) (2022-04-11)


### Features

* auto transform url template ([106e585](https://www.github.com/keq-request/keq-cli/commit/106e585f7c9e480a541bd2350b51836a6a31b3f9))

### [2.1.2](https://www.github.com/keq-request/keq-cli/compare/v2.1.1...v2.1.2) (2022-03-21)


### Bug Fixes

* the return type of operation is a Keq<T> rather than Promise ([30f4db4](https://www.github.com/keq-request/keq-cli/commit/30f4db4e5e12636f8ea2b489314493ff433ef97f))

### [2.1.1](https://www.github.com/keq-request/keq-cli/compare/v2.1.0...v2.1.1) (2022-03-01)


### Bug Fixes

* not render array items, if reponse is an array ([6912b44](https://www.github.com/keq-request/keq-cli/commit/6912b4424b40585202c6a2778ed0a6a22223c214))

## [2.1.0](https://www.github.com/keq-request/keq-cli/compare/v2.0.2...v2.1.0) (2022-02-25)


### Features

* it is no longer necessary to fill in the parameter, if no parameters ([05c0f44](https://www.github.com/keq-request/keq-cli/commit/05c0f44553aadf10e8d09f7a235689826891dbf7))


### Bug Fixes

* generate error when response body is an array ([a4cdfc0](https://www.github.com/keq-request/keq-cli/commit/a4cdfc07c14121bfe443ad7eb0d247961d27fcfe))

### [2.0.2](https://www.github.com/keq-request/keq-cli/compare/v2.0.1...v2.0.2) (2022-01-17)


### Bug Fixes

* component schmea not find in schema file ([1b4711c](https://www.github.com/keq-request/keq-cli/commit/1b4711cb7201199da87ffdf39581d86878767eb8))

### [2.0.1](https://www.github.com/keq-request/keq-cli/compare/v2.0.0...v2.0.1) (2022-01-17)


### Bug Fixes

* component schmea not find in operation ([6084457](https://www.github.com/keq-request/keq-cli/commit/6084457e921be01ad8fe3bdc14e3d231a1f21fdc))

## [2.0.0](https://www.github.com/keq-request/keq-cli/compare/v1.2.2...v2.0.0) (2022-01-17)


### ⚠ BREAKING CHANGES

* Never export operation/schema as default; No longer support keq-proxy<1.2, keq<1.7.

### Features

* change the import method and auto export all module operations ([1cc5038](https://www.github.com/keq-request/keq-cli/commit/1cc50380f2fb80c7948442134db7d399585ee761))


### Bug Fixes

* import the self file ([4110d1d](https://www.github.com/keq-request/keq-cli/commit/4110d1d76bf34c5e9fe191561efb792dafa50c37))
* incorrect file path import ([53fadc7](https://www.github.com/keq-request/keq-cli/commit/53fadc787f572da3cd9e3c2a131c6908f1df5801))
* multiline comments do not handle line break ([c6e407a](https://www.github.com/keq-request/keq-cli/commit/c6e407a214cd909970ed64cb424d7263b92d971c))

### [1.2.2](https://www.github.com/keq-request/keq-cli/compare/v1.2.1...v1.2.2) (2021-05-14)


### Bug Fixes

* unused env variable in module template ([7d3b567](https://www.github.com/keq-request/keq-cli/commit/7d3b56703adf7e7d2c3fb1e6edce926698d4c910))

### [1.2.1](https://www.github.com/keq-request/keq-cli/compare/v1.2.0...v1.2.1) (2021-05-13)


### Bug Fixes

* url is optional field but throw error when it is not set ([14140a2](https://www.github.com/keq-request/keq-cli/commit/14140a2b9d754d36510c6cef1ffd1c7de0f2ca2b))

## [1.2.0](https://www.github.com/keq-request/keq-cli/compare/v1.1.3...v1.2.0) (2021-05-13)


### Features

* add strict mode ([1f0391d](https://www.github.com/keq-request/keq-cli/commit/1f0391dc2ec4f1890339bb951d19cebe9400b9b3))
* beautify stderr ([7782e38](https://www.github.com/keq-request/keq-cli/commit/7782e381b91f00465f5952d627e18ff3e44bf042))


### Bug Fixes

* `$ref` is not imported ([6a202b2](https://www.github.com/keq-request/keq-cli/commit/6a202b2f41dbf491acee9195dc95e7ec3e1048c8))
* not throw error when config invalid ([83abe3b](https://www.github.com/keq-request/keq-cli/commit/83abe3b9d045ff27a532cc48a6335afcaf6b165e))
* unknown keyword "require" in ajv@8 ([aba034c](https://www.github.com/keq-request/keq-cli/commit/aba034c8a7d2daa9abd7214e41e3baaecef32d91))

### [1.1.3](https://www.github.com/keq-request/keq-cli/compare/v1.1.2...v1.1.3) (2021-05-12)


### Bug Fixes

* unable build ([0f56acf](https://www.github.com/keq-request/keq-cli/commit/0f56acff7f2bec334395d8a81d89bd210d9507ef))

### [1.1.2](https://www.github.com/keq-request/keq-cli/compare/v1.1.1...v1.1.2) (2021-05-12)


### Bug Fixes

* cannot find ajv ([0e4fd9c](https://www.github.com/keq-request/keq-cli/commit/0e4fd9cdae9f74d996effb423aac33c370458f37))

### [1.1.1](https://www.github.com/keq-request/keq-cli/compare/v1.1.0...v1.1.1) (2021-05-12)


### Bug Fixes

* keq should be dependencies ([b862714](https://www.github.com/keq-request/keq-cli/commit/b8627141afa95703614392cb53afde715942fbaa))
* valid-url is undefined ([bdacad6](https://www.github.com/keq-request/keq-cli/commit/bdacad6f952701e08217a1d2a0ea5631b5f865a4))

## [1.1.0](https://www.github.com/keq-request/keq-cli/compare/v1.0.3...v1.1.0) (2021-05-11)


### Features

* can get swagger file from url ([3f64462](https://www.github.com/keq-request/keq-cli/commit/3f64462c0dc2ed2c845c812d6a32e32135e1836b)), closes [#4](https://www.github.com/keq-request/keq-cli/issues/4)

### [1.0.3](https://www.github.com/keq-request/keq-cli/compare/v1.0.2...v1.0.3) (2021-05-11)


### Bug Fixes

* cannot find ramda ([4270dca](https://www.github.com/keq-request/keq-cli/commit/4270dca65d5a5ce2c8cc08368692199dc9f13227))

### [1.0.2](https://www.github.com/keq-request/keq-cli/compare/v1.0.1...v1.0.2) (2021-05-11)


### Bug Fixes

* cannot find fs-extra ([d68d049](https://www.github.com/keq-request/keq-cli/commit/d68d049a34e09c622bed6da72283f373e62ab41b))

### [1.0.1](https://www.github.com/keq-request/keq-cli/compare/v1.0.0...v1.0.1) (2021-05-11)


### Bug Fixes

* the file path of bin cannot run ([c6c9cf3](https://www.github.com/keq-request/keq-cli/commit/c6c9cf301e6a5bf1b39e02399da39749454ebfa0))

## 1.0.0 (2021-05-06)
