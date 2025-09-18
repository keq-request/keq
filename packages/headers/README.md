<!-- title -->
<p align="center" style="padding-top: 41px">
  <img src="https://raw.githubusercontent.com/keq-request/keq/refs/heads/master/images/logo.svg" width="121" alt="logo" />
</p>

<h2 align="center" style="text-align: center">KEQ-HEADERS</h2>
<!-- title -->

[![version](https://img.shields.io/npm/v/keq-headers.svg?style=for-the-badge)](https://www.npmjs.com/package/keq-headers)
[![downloads](https://img.shields.io/npm/dm/keq-headers.svg?style=for-the-badge)](https://www.npmjs.com/package/keq-headers)
[![license](https://img.shields.io/npm/l/keq-headers.svg?style=for-the-badge)](https://www.npmjs.com/package/keq-headers)
[![dependencies](https://img.shields.io/librariesio/release/npm/keq-headers?style=for-the-badge)](https://www.npmjs.com/package/keq-headers)
[![Codecov](https://img.shields.io/codecov/c/gh/keq-request/keq-headers?logo=codecov&token=PLF0DT6869&style=for-the-badge)](https://codecov.io/gh/keq-request/keq-headers)

[Document EN]: https://keq-request.github.io/guide/libraries/keq-headers
[Document CN]: https://keq-request.github.io/zh/guide/libraries/keq-headers

[**Document**][Document EN] | [**中文文档**][Document CN]

Set/Append headers to request.

## Usage

```typescript
import { request } from "keq";
import {
  setHeader,
  setHeaders,
  appendHeader,
  appendHeaders,
  insertHeader,
  insertHeaders,
} from "keq-headers";

request
  .use(setHeader("x-user-name", "Kerry"))
  .use(appendHeader("x-user-name", "Marry"))
  .use(insertHeader("x-user-name", "J"))
  .use(
    setHeaders({
      "x-user-name": "Kerry",
      "x-user-id": "1",
    })
  )
  .use(
    appendHeaders({
      "x-user-name": "Marray",
      "x-user-id": "1",
    })
  )
  .use(
    insertHeaders({
      "x-user-name": "J",
      "x-user-id": 1,
    })
  );
```

| **Middleware** | **Description**                                                            |
| :------------- | :------------------------------------------------------------------------- |
| setHeader      | Set a header.If it already exists, the original value will be overwritten. |
| setHeaders     | Set headers.If it already exists, the original value will be overwritten.  |
| appendHeader   | Append a header.                                                           |
| appendHeaders  | Append headers.                                                            |
| insertHeader   | Set a header, if it isn't existed.                                         |
| insertHeaders  | Set headers, if it isn't existed.                                          |

## Contributing & Development

If there is any doubt, it is very welcome to discuss the issue together.
