<p align="center" style="padding-top: 40px">
  <img src="./images/logo.svg?sanitize=true" width="120" alt="logo" />
</p>

<h1 align="center" style="text-align: center">KEQ</h1>

[npm]: https://www.npmjs.com/package/keq

[![version](https://img.shields.io/npm/v/keq.svg?logo=npm&style=for-the-badge)][npm]
[![downloads](https://img.shields.io/npm/dm/keq.svg?logo=npm&style=for-the-badge)][npm]
[![dependencies](https://img.shields.io/librariesio/release/npm/keq?logo=npm&style=for-the-badge)][npm]
[![license](https://img.shields.io/npm/l/keq.svg?logo=github&style=for-the-badge)][npm]
[![Codecov](https://img.shields.io/codecov/c/gh/keq-request/keq?logo=codecov&token=PLF0DT6869&style=for-the-badge)](https://codecov.io/gh/keq-request/keq)

[Document EN]: https://keq-request.github.io/en/docs/introduction
[Document CN]: https://keq-request.github.io/docs/introduction

A modern HTTP client library built with TypeScript, offering flexibility, readability, and a low learning curve. Wraps the Fetch API with chainable methods and middleware support. Works in browsers and Node.js.

[📖 **Documentation**][Document EN] | [📖 **中文文档**][Document CN]

## Quick Start

```bash
npm install keq
```

```javascript
import { request } from "keq";

// Get request
const users = await request
  .get("/api/cats")
  .query('color', 'gray')

// POST request with JSON body
const cat = await request
  .post("/api/cats")
  .send({ name: "mimi" });
```

For more examples and detailed documentation, visit the [official documentation][Document EN].

## Contributing & Development

If there is any doubt, it is very welcome to discuss the issue together.

![github-keq-request-keq](https://count.getloli.com/@github-keq-request-keq?theme=asoul)
