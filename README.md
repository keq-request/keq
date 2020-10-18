# keq

[![version](https://img.shields.io/npm/v/keq.svg?style=flat-square)](https://www.npmjs.com/package/keq)
[![downloads](https://img.shields.io/npm/dm/keq.svg?style=flat-square)](https://www.npmjs.com/package/keq)
[![license](https://img.shields.io/npm/l/keq.svg?style=flat-square)](https://www.npmjs.com/package/keq)
[![dependencies](https://img.shields.io/david/Val-istar-Guo/keq.svg?style=flat-square)](https://www.npmjs.com/package/keq)
[![coveralls](https://img.shields.io/coveralls/github/Val-istar-Guo/keq.svg?style=flat-square)](https://coveralls.io/github/Val-istar-Guo/keq)



<!-- description -->
[Headers MDN]: https://developer.mozilla.org/en-US/docs/Web/API/Headers
[Response MDN]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[FormData MDN]: https://developer.mozilla.org/en-US/docs/Web/API/FormData

Keq is a request API write by Typescript for flexibility, readability, and a low learning curve. It also works with Node.js!

Keq wraps the [cross-fetch](https://www.npmjs.com/package/cross-fetch) and use Fetch APIs whenever possible.
Like [`Headers`][Headers MDN], [`Response`][Response MDN], [`FormData`][FormData MDN] objects.
<!-- description -->

## Usage

<!-- usage -->

### Send Request

A request can be initiated by invoking the appropriate method on the request object,
then calling `.then()` (or `.end()` or `await`) to send the request.
For example a simple GET request:

```javascript
import { request } from 'keq'

const body = await request
  .get('/search')
  .set('X-Origin-Host', 'https://example.com')
  .query('key1', 'value1')
```

Request can be initiated by:

```javascript
import { request } from 'keq'

const body = await request({
  url: '/search',
  method: 'get',
})
```

Absolute URLs can be used.
In web browsers absolute URLs work only if the server implements CORS.

```javascript
import { request } from 'keq'

const body = await request
  .get('https://example.com/search')
```

**DELETE**, **HEAD**, **PATCH**, **POST**, and **PUT** requests can also be used, simply change the method name:

```javascript
import { request } from 'keq'

await request.head('https://example.com/search')
await request.patch('https://example.com/search')
await request.post('https://example.com/search')
await request.put('https://example.com/search')
await request.delete('https://example.com/search')
await request.del('https://example.com/search')
```

> `.del()` is the alias of `.delete()`.

`Keq` will parse `body` according to the `Content-Type` of  [`Response`][Response MDN]
and return `body` of [`Response`][Response MDN] by defaulted.
Add option `resolveWithFullResponse` to get the origin  [`Response`][Response MDN] Object.

```javascript
import { request } from 'keq'

const response = await request
  .get('http://example.com')
  .option('resolveWithFullResponse')

const body = await response.json()
```


### Setting header fields

Setting header fields is simple, invoke `.set()` with a field name and value:

```javascript
import { request } from 'keq'

await request
  .get('/search')
  .set('X-Origin-Host', 'https://example.com')
  .set('Accept', 'application/json')
```

You may also pass an object or `Headers` to set several fields in a single call:

```javascript
import { request } from 'keq'

await request
  .get('/search')
  .set({
    'X-Origin-Host': 'https://example.com',
    'Accept': 'application/json',
  })
```

### Request query

The `.query()` method accepts objects,
which when used with the GET method will form a query-string.
The following will produce the path `/search?query=Manny&range=1..5&order=desc.`

```javascript
import { request } from 'keq'

await request
   .get('/search')
   .query({ query: 'Manny' })
   .query({ range: '1..5' })
   .query('order', 'desc')
```

Or as a single object:

```javascript
import { request } from 'keq'

await request
   .get('/search')
   .query({ query: 'Manny',  range: '1..5', order: 'desc' })
```

### JSON Request

A typical JSON POST request might look a little like the following,
where we set the `Content-Type` header field appropriately:

```javascript
import { request } from 'keq'

await request.post('/user')
  .set('Content-Type', 'application/json')
  .send({ name:"tj", pet:"tobi" })
```

When passed an `object` to `.send()`, it will auto set `Content-Type` to `application/json`

### x-www-form-urlencoded Request

A typical Form POST request might look a little like the following:

```javascript
import { request } from 'keq'

await request.post('/user')
  .type('form')
  .send({ name:"tj", pet:"tobi" })
  .send('pet=tobi')
```
To send the data as `application/x-www-form-urlencoded` simply invoke `.type()` with "form".
When passed an `string` to `.send()`, it will auto set `Content-Type` to `application/x-www-form-urlencoded`.

> When calling `.send ()` multiple times, the value of `Content-Type` will only be set when the first calling `.send ()`.

### Form-Data Request

A typical Form POST request might look a little like the following:

```javascript
import { request, FormData } from 'keq'

const form = new FormData()
form.append('name', 'tj')
form.append('pet', 'tobi')

await request.post('/user')
  .type('form-data')
  .send(form)
```

When passed an `FormData` object to `.send()`, it will auto set `Content-Type` to `multipart/form-data`.

`FormData` exported from 'keq' will use [formdata-node](https://www.npmjs.com/package/formdata-node) in NodeJS and the default `FormData` in the browser

You can append field by invoke `.field()` and `.attach()`

```javascript
import { request } from 'keq'

await request.post('/user')
  .field('name', 'tj')
  .field('pet', 'tobi')
  .attach('image', imageBlobOrBuffer)
```


### Setting the Content-Type

The obvious solution is to use the .set() method:

```javascript
import { request } from 'keq'

await request.post('/user')
  .set('Content-Type', 'application/json')
```

As a short-hand the .type() method is also available,
accepting the canonicalized MIME type name complete with type/subtype,
or simply the extension name such as "xml", "json", "png", etc:

```javascript
import { request } from 'keq'

await request.post('/user')
  .type('json')
```

**Shorthand**                                 | **Mime Type**
:---------------------------------------------|:----------------------------------
json, xml                                     | application/json, application/xml
form                                          | application/x-www-form-urlencoded
html, css                                     | text/html, text/css
form-data                                     | multipart/form-data
jpeg, bmp, apng, gif, x-icon, png, webp, tiff | image/jpeg, image/bmp, image/apng, image/gif, image/x-icon, image/png, image/webp, image/tiff
svg                                           | image/svg+xml


### Serializing request body

Keq will automatically serialize JSON and forms.
You can setup automatic serialization for other types as well:

```javascript
import { request } from 'keq'

await request
  .post('/user')
  .send({foo: 'bar'})
  .serialize(obj => {
      return 'string generated from obj';
  });
```

### Keq Internal Options

Invoke `.option()` add options.

```javascript
import { request } from 'keq'

await request
  .get('http://example.com')
  .option('resolveWithFullResponse')
  .option('middlewareOption', 'value')
```

Or as a single object:

```javascript
import { request } from 'keq'

await request
  .get('http://example.com')
  .options({
    resolveWithFullResponse: true,
    middlewareOption: 'value',
  })
```

**Option**                | **Description**
:-------------------------|:---------------------------
`resolveWithFullResponse` | Get the origin  [`Response`][Response MDN] Object.
`fetchAPI`                | Replace the defaulted `fetch` function used by `Keq`.

### Middleware

You can write/import middleware to extend `Keq`.
A typical middleware might look a little like the following:

```javascript
import { request } from 'keq'

const middleware = async (context, next) => {
  context.request.url.query.limit = 10
  context.request.url.query.offset = 0

  await next()
  const response = context.response
  if (!response) return
  const body = await response.json()
  response.output = JSON.stringify(body)
}

// Global Middleware
request
  .use(middleware)
  .use('example.com', middleware)

// Request Middleware
await request
  .get('http://example.com')
  .use(middleware)
```

#### request.use(middleware)

Add an global middleware, The running order of middleware is related to the order of `.use()`

#### request.use(host, middleware)

Add an global middleware that only enabled at the `host`.

#### write an middleware

Middleware should be an asnyc-function that accept two argument.
The first is the keq context that includes request parameters, keq options...
The second is the `next()` function used to execute the next middleware.
The last `next()` function will send request and bind the [`Response`][Response MDN] object to `context.res`.

**Property**                  | **Type**
:-----------------------------|:------------------------------------
`context.request`             | Includes request options for Fetch API.
`context.request.url`         | The return type of `url.parse('http://example.com', true)`.
`context.request.method`      | One of 'get', 'post', 'put', 'patch', 'head', 'delete'.
`context.request.body`        | Object, Array, Stream, Blob or undefined.
`context.request.headers`     | The [`Headers`][Headers MDN] Object.
`context.request.options`     | Other options that can be passed into the Fetch API.
`context.url`                 | Access to `context.request.url`.
`context.query`               | Access to `context.request.url.query`.
`context.headers`             | Access to `context.request.headers`.
`context.body`                | Access to `context.request.body`.
`context.options`             | It is an object includes request options.(example: `context.options.resolveWithFullResponse`).
`context.res`                 | The origin [`Response`][Response MDN] Object. It will be undefined before run `await next()` or error throwed.
`context.response`            | Cloned from `ctx.res`.
`context.output`              | The return value of `await request()`. By defaulted, `context.output` is the parsed body of response. `context.output` will be the `ctx.response` When `options.resolveWithFullResponse` is true.

<!-- usage -->

<!-- addition -->

## Q&A

### The diffirent between `.then()` and `.end()`

Both `.then ()` and `.end ()` will send a request and return a Promise object.
The difference between the two is that when called multiple times.

`.then ()` actually sends only one request, no matter how many times it is called.

`.end ()` will send a request for each call.

```javascript
import { request } from 'keq'

const keq = request.get('http://example.com')

keq.then(onfulfilled, onrejected)
// Won't send request, and will use the last request result.
keq.then(onfulfilled, onrejected)

keq.end()
keq.end()
```

### The diffirent between `ctx.res` and `ctx.response`

`ctx.response` will allways return a new [`Response`][Response MDN] created by `ctx.res && ctx.res.clone()`. Sothat each middleware could calling `ctx.response.json()`, `ctx.response.text()`, `ctx.response.formData()`.

What's more, The `.formData()` function isn't existed in `Response` returned by `node-fetch`. keq will append it to `Response` after clone, if in `NodeJS`.


## See More

Keq is inspired by SuperAgent and Koa.

- [Superagent](https://visionmedia.github.io/superagent/#test-documentation)
- [Koa](https://koajs.com/)
<!-- addition -->

## Sponsor

Support code development on patron.

[![patron](https://c5.patreon.com/external/logo/become_a_patron_button@2x.png)](https://www.patreon.com/bePatron?u=22478507)

## Contributing & Development

If there is any doubt, it is very welcome to discuss the issue together.
Please read [Contributor Covenant Code of Conduct](.github/CODE_OF_CONDUCT.md) and [CONTRIBUTING](.github/CONTRIBUTING.md).
