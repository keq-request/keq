<!-- title -->
<p align="center" style="padding-top: 41px">
  <img src="https://raw.githubusercontent.com/keq-request/keq/refs/heads/master/images/logo.svg" width="121" alt="logo" />
</p>

<h2 align="center" style="text-align: center">KEQ-URL</h2>
<!-- title -->

[![version](https://img.shields.io/npm/v/keq-url.svg?style=for-the-badge)](https://www.npmjs.com/package/keq-url)
[![downloads](https://img.shields.io/npm/dm/keq-url.svg?style=for-the-badge)](https://www.npmjs.com/package/keq-url)
[![license](https://img.shields.io/npm/l/keq-url.svg?style=for-the-badge)](https://www.npmjs.com/package/keq-url)
[![dependencies](https://img.shields.io/librariesio/release/npm/keq-url?style=for-the-badge)](https://www.npmjs.com/package/keq-url)
[![Codecov](https://img.shields.io/codecov/c/gh/keq-request/keq-url?logo=codecov&token=PLF0DT6869&style=for-the-badge)](https://codecov.io/gh/keq-request/keq-url)

[Document EN]: https://keq-request.github.io/guide/libraries/keq-url
[Document CN]: https://keq-request.github.io/zh/guide/libraries/keq-url

[**Document**][Document EN] | [**中文文档**][Document CN]

[Keq](https://github.com/keq-request/keq) middleware for setting the request url.

## Usage

### `setBaseUrl(baseUrl)`

```typescript
import { request } from "keq";
import { setBaseUrl, setHost } from "keq-url";

request.use(setBaseUrl("http://example.com/api"));

await request.get("/test");
// it will send request to 'http://example.com/api/test'
```

### `setOrigin(origin)`

```typescript
import { request } from "keq";
import { setOrigin } from "keq-url";

request.use(setOrigin("http://example.com:8080"));

await request.get("http://test.com/test");
// it will send request to 'http://example.com:8080/test'
```

### `setHost(host)`

```typescript
import { request } from "keq";
import { setHost } from "keq-url";

request.use(setHost("example.com"));

await request.get("http://test.com/test");
// it will send request to 'http://example.com/test'
```

## Contributing & Development

If there is any doubt, it is very welcome to discuss the issue together.
