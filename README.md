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


[Fetch MDN]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch
[Headers MDN]: https://developer.mozilla.org/en-US/docs/Web/API/Headers
[Response MDN]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[FormData MDN]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[URL MDN]: https://developer.mozilla.org/en-US/docs/Web/API/URL

[Document EN]: https://keq-request.github.io/guide/introduction
[Document CN]: https://keq-request.github.io/zh/guide/introduction

Keq is a request API write by Typescript for flexibility, readability, and a low learning curve. It also works with Node.js!
Keq wraps the Fetch APIs, adding chain calls and middleware functions.


[**Document**][Document EN] | [**中文文档**][Document CN]

## Simple Usage


<!-- usage -->

### Send Request

A request can be initiated by invoking the appropriate method on the request object,
then calling `.then()` (or `.end()` or `await`) to send the request.
For example a simple GET request:

```javascript
import { request } from "keq";

const body = await request
  .get("/search")
  .set("X-Origin-Host", "https://example.com")
  .query("key1", "value1");
```

Request can be initiated by:

```javascript
import { request } from "keq";

const body = await request({
  url: "/search",
  method: "get",
});
```

Absolute URLs can be used.
In web browsers absolute URLs work only if the server implements CORS.

```javascript
import { request } from "keq";

const body = await request.get("https://example.com/search");
```

**DELETE**, **HEAD**, **PATCH**, **POST**, and **PUT** requests can also be used, simply change the method name:

```javascript
import { request } from "keq";

await request.head("https://example.com/search");
await request.patch("https://example.com/search");
await request.post("https://example.com/search");
await request.put("https://example.com/search");
await request.delete("https://example.com/search");
await request.del("https://example.com/search");
```

> `.del()` is the alias of `.delete()`.

`Keq` will parse `body` according to the `Content-Type` of [`Response`][Response MDN]
and return `undefined` if `Content-Type` not found.
Add invoke `.resolveWith('response')` to get the origin [`Response`][Response MDN] Object.

```javascript
import { request } from "keq";

const response = await request
  .get("http://test.com")
  .resolve('response')

const body = await response.json();
```

We will introduce `resolveWith` in more detail later.

###### `Keq` won't auto parse body, if response.status is 204. The HTTP 204 No Content success status response code indicates that server has fulfilled the request but does not need to return an entity-body, and might want to return updated meta information

### Setting header fields

Setting header fields is simple, invoke `.set()` with a field name and value:

```javascript
import { request } from "keq";

await request
  .get("/search")
  .set("X-Origin-Host", "https://example.com")
  .set("Accept", "application/json");
```

You may also pass an object or `Headers` to set several fields in a single call:

```javascript
import { request } from "keq";

await request
  .get("/search")
  .set({
    "X-Origin-Host": "https://example.com",
    Accept: "application/json",
  });
```

### Request query

The `.query()` method accepts objects,
which when used with the GET method will form a query-string.
The following will produce the path `/search?query=Manny&range=1..5&order=desc.`

```javascript
import { request } from "keq";

await request
  .get("/search")
  .query({ query: "Manny" })
  .query({ range: "1..5" })
  .query("order", "desc");
```

Or as a single object:

```javascript
import { request } from "keq";

await request
  .get("/search")
  .query({ query: "Manny", range: "1..5", order: "desc" });
```

### Request routing parameters

The `.params()` method accepts key and value, which when used for the request with routing parameters.

```javascript
import { request } from "keq";

await request
  // request to /users/jack/books/kafka
  .get("/users/:userName/books/{bookName}")
  .params("userName", 'jack');
  .params("bookName", "kafka");
  // or invoke with an object
  .params({
    "userName": "jack",
    "bookName": "kafka"
  })
```

### JSON Request

A typical JSON POST request might look a little like the following,
where we set the `Content-Type` header field appropriately:

```javascript
import { request } from "keq";

await request
  .post("/user")
  .set("Content-Type", "application/json")
  .send({ name: "tj", pet: "tobi" });
```

When passed an `object` to `.send()`, it will auto set `Content-Type` to `application/json`

### x-www-form-urlencoded Request

A typical Form POST request might look a little like the following:

```javascript
import { request } from "keq";

await request
  .post("/user")
  .type("form")
  .send({ name: "tj", pet: "tobi" })
  .send("pet=tobi");
```

To send the data as `application/x-www-form-urlencoded` simply invoke `.type()` with "form".
When passed an `string` to `.send()`, it will auto set `Content-Type` to `application/x-www-form-urlencoded`.

> When calling `.send ()` multiple times, the value of `Content-Type` will only be set when the first calling `.send ()`.

### Form-Data Request

A typical Form POST request might look a little like the following:

```javascript
import { request } from "keq";

const form = new FormData();
form.append("name", "tj");
form.append("pet", "tobi");

// prettier-ignore
await request
  .post("/user")
  .type("form-data")
  .send(form)
```

When passed an `FormData` object to `.send()`, it will auto set `Content-Type` to `multipart/form-data`.

You can append field by invoke `.field()` and `.attach()`

```javascript
import { request } from "keq";

await request
  .post("/user")
  .field("name", "tj")
  .field("pet", "tobi")
  .attach("file", new Blob(["I am tj"]));
```

### Setting the Content-Type

The obvious solution is to use the .set() method:

```javascript
import { request } from "keq";

// prettier-ignore
await request
  .post("/user")
  .set("Content-Type", "application/json")
```

As a short-hand the .type() method is also available,
accepting the canonicalized MIME type name complete with type/subtype,
or simply the extension name such as "xml", "json", "png", etc:

```javascript
import { request } from "keq";

await request
  .post("/user")
  .type("json");
```

| **Shorthand**                                 | **Mime Type**                                                                                 |
| :-------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| json, xml                                     | application/json, application/xml                                                             |
| form                                          | application/x-www-form-urlencoded                                                             |
| html, css                                     | text/html, text/css                                                                           |
| form-data                                     | multipart/form-data                                                                           |
| jpeg, bmp, apng, gif, x-icon, png, webp, tiff | image/jpeg, image/bmp, image/apng, image/gif, image/x-icon, image/png, image/webp, image/tiff |
| svg                                           | image/svg+xml                                                                                 |

### Set Request Redirect mode

Follow redirect by default, invoke `.redirect(mode)` to set the redirect mode. Allow values are `"error"`, `"manual"` and `"follow"`.

```javascript
import { request } from "keq";

await request
  .get("http://test.com")
  .redirect("manual");
```

### Set Request Credentials And Mode

These two parameters are used to control cross-domain requests.

```javascript
import { request } from "keq";

await request
  .get("http://test.com")
  .mode("cors")
  .credentials("include");
```

### resolve responseBody

It was mentioned before that `Keq` will automatically parses the response body.
And we can control the parsing behavior by calling `.resolveWith(method)`.
There are multiple parsing methods for us to choose from

| method                       | description                                                                                                                                                                                          |
| :--------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.resolveWith('intelligent')`  | It is the default method of `Keq`. This will returned `context.output` first if it exists. Otherwise return undefined when the response status is 204. Or return parsed response body according to the `Content-Type` of [`Response`][Response MDN]. |
| `.resolveWith('response')`     | Return [`Response`][Response MDN].                                                                                                                                                                   |
| `.resolveWith('text')`         | Return `response.text()`.                                                                                                                                                                            |
| `.resolveWith('json')`         | Return `response.json()`.                                                                                                                                                                            |
| `.resolveWith('form-data')`    | Return `response.formData()`.                                                                                                                                                                        |
| `.resolveWith('blob')`         | Return `response.blob()`.                                                                                                                                                                            |
| `.resolveWith('array-buffer')` | Return `response.arrayBuffer()`                                                                                                                                                                      |


See more usage in the [Document][Document EN]

## Contributing & Development

If there is any doubt, it is very welcome to discuss the issue together.

![github-keq-request-keq](https://count.getloli.com/@github-keq-request-keq?theme=asoul)
