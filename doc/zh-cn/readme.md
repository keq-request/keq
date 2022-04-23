<!-- title -->
<p align="center" style="padding-top: 40px">
  <img src="../../images/logo.svg?sanitize=true" width="60" alt="logo" />
</p>

<h1 align="center" style="text-align: center">KEQ</h1>
<!-- title -->

[![version](https://img.shields.io/npm/v/keq.svg?style=flat-square)](https://www.npmjs.com/package/keq)
[![downloads](https://img.shields.io/npm/dm/keq.svg?style=flat-square)](https://www.npmjs.com/package/keq)
[![license](https://img.shields.io/npm/l/keq.svg?style=flat-square)](https://www.npmjs.com/package/keq)
[![dependencies](https://img.shields.io/david/Val-istar-Guo/keq.svg?style=flat-square)](https://www.npmjs.com/package/keq)
[![coveralls](https://img.shields.io/coveralls/github/Val-istar-Guo/keq.svg?style=flat-square)](https://coveralls.io/github/Val-istar-Guo/keq)



<!-- description -->
[Headers MDN]: https://developer.mozilla.org/en-US/docs/Web/API/Headers
[Response MDN]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[FormData MDN]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[FETCH API]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API


Keq是完全使用Typescript编写的，具有灵活性，可读性和较低的学习曲线的`request`库。它也可以与Node.js一起使用！


Keq默认情况下是包装[cross-fetch](https://www.npmjs.com/package/cross-fetch)，并尽可能使用[Fetch API][FETCH API]。
例如：[`Headers`][Headers MDN]，[`Response`][Response MDN]，[`FormData`][FormData MDN]对象。
<!-- description -->

## Usage

<!-- usage -->

### Send Request

Keq可以通过链式调用创建请求， 然后调用`.then（）`（或`.end（）`或`await`）发送请求。
例如发送一个简单的GET请求：


```javascript
import { request } from 'keq'

const body = await request
  .get('/search')
  .set('X-Origin-Host', 'https://example.com')
  .query('key1', 'value1')
```

也可以这样来创建请求：

```javascript
import { request } from 'keq'

const body = await request({
  url: '/search',
  method: 'get',
})
```

在浏览器中使用绝对路径需要后端支持CORS跨域：

```javascript
import { request } from 'keq'

const body = await request
  .get('https://example.com/search')
```

支持所有method类型：

```javascript
import { request } from 'keq'

await request.head('https://example.com/search')
await request.patch('https://example.com/search')
await request.post('https://example.com/search')
await request.put('https://example.com/search')
await request.delete('https://example.com/search')
await request.del('https://example.com/search')
```

> `.del()`是`.delete()`的别名

`Keq`将根据[`Response`][Response MDN]的`Content-Type`解析`body`。
并默认返回[`Response`][Response MDN]的`body`。
将`resolveWithFullResponse`设置为`true`，可以获得[`Response`][Response MDN]对象。

```javascript
import { request } from 'keq'

const response = await request
  .get('http://test.com')
  .option('resolveWithFullResponse')

const body = await response.json()
```


### 设置请求头

调用`.set()`方法就可以很容易的设置请求头：

```javascript
import { request } from 'keq'

await request
  .get('/search')
  .set('X-Origin-Host', 'https://example.com')
  .set('Accept', 'application/json')
```

也可以传入对象，以便一次性设置多个请求头：

```javascript
import { request } from 'keq'

await request
  .get('/search')
  .set({
    'X-Origin-Host': 'https://example.com',
    'Accept': 'application/json',
  })
```

### 设置 Query

`.query()`方法接受`object`或者两个字符串作为参数。以下代码将会请求`/search?query=Manny&range=1..5&order=desc`。

```javascript
import { request } from 'keq'

await request
   .get('/search')
   .query({ query: 'Manny' })
   .query({ range: '1..5' })
   .query('order', 'desc')
```

或者传入一个`object`：

```javascript
import { request } from 'keq'

await request
   .get('/search')
   .query({ query: 'Manny',  range: '1..5', order: 'desc' })
```

### 设置路由参数

`.params()` 方法接受`object`或者两个字符串作为参数。以下代码将会请求`/search/keq`。

```javascript
import { request } from 'keq'

await request
  .get('/search/:searchKey')
  .params('searchKey', 'keq')
```

或者传入一个`object`：

```javascript
import { request } from 'keq'

await request
  .get('/search/:searchKey')
  .params({ searchKey: 'keq' })
```


### 发送 JSON 请求

下面是一个发送 JSON 请求的示例，在示例中我们明确设置了`Content-Type`：

```javascript
import { request } from 'keq'

await request.post('/user')
  .set('Content-Type', 'application/json')
  .send({ name:"tj", pet:"tobi" })
```

其实手动设置`Content-Type`头是多余的操作，`.send()`函数在接收`object`作为参数时会自动的将`Content-Type`设置为`application/json`。

### 发送 x-www-form-urlencoded 请求

发送 x-www-form-urlencoded 请求的示例如下：

```javascript
import { request } from 'keq'

await request.post('/user')
  .type('form')
  .send({ name:"tj", pet:"tobi" })
  .send('pet=tobi')
```

`.send()`函数在接收一个纯字符串（例如：`'pet=tobi'`)作为参数时，会自动的将`Content-Type`设定为`application/x-www-form-urlencoded`。
如果你想像send函数传入`object`作为参数并且要发送`x-www-form-urlencoded`请求，则必须明确的设定`Content-Type`才可以。

> When calling `.send ()` multiple times, the value of `Content-Type` will only be set when the first calling `.send ()`.

### 发送 Form-Data 请求

发送 form-data 请求的示例如下：

```javascript
import { request, FormData } from 'keq'

const form = new FormData()
form.append('name', 'tj')
form.append('pet', 'tobi')

await request.post('/user')
  .type('form-data')
  .send(form)
```

`.send()`函数在接受`FormData`对象作为参数的时候，会自动的将`Content-Type`设定为`multipart/form-data`。
和之前一样，如果想要传入`object`作为`.send()`的参数，需要明确设定`Content-Type`。

###### 注：在NodeJS中，Keq使用[formdata-node](https://www.npmjs.com/package/formdata-node)库支持`FormData`。在浏览器中则使用浏览器的原生对象。

另外，使用`.field()`和`.attach()`也可以构造form-data请求：

```javascript
import { request } from 'keq'

await request.post('/user')
  .field('name', 'tj')
  .field('pet', 'tobi')
  .attach('image', imageBlobOrBuffer)
```

同样的如果你没有明确设定`Content-Type`，`.field()`和`.attach()`也会自动的设定`Content-Type`。


### 设置 Content-Type

使用`.set()`：

```javascript
import { request } from 'keq'

await request.post('/user')
  .set('Content-Type', 'application/json')
```

`.type()`是一个更友好的API：

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


### 序列化请求体

Keq 会自动序列号Json和form，你也可以设定自己的序列化方法：

```javascript
import { request } from 'keq'

await request
  .post('/user')
  .send({foo: 'bar'})
  .serialize((obj, ctx) => {
      return 'string generated from obj';
  });
```

`.serialize(callback)`方法中`callback`的返回值将会直接作为[`Fetch API`](FETCH API)的`body`参数。

`callback(obj, ctx)`的参数表：

 **Arguments**                                 | **Description**
:----------------------------------------------|:------------------------------------
 `obj`（第一个参数）                             | 未序列化的Body
 `ctx`（第二个参数）                             | Keq上下文对象



### Keq内置选项

调用 `.option()` 方法设置选项

```javascript
import { request } from 'keq'

await request
  .get('http://test.com')
  .option('resolveWithFullResponse')
  .option('middlewareOption', 'value')
```

或者直接传入一个`object`设置：

```javascript
import { request } from 'keq'

await request
  .get('http://test.com')
  .options({
    resolveWithFullResponse: true,
    middlewareOption: 'value',
  })
```

**Option**                    | **Description**
:-----------------------------|:---------------------------
`resolveWithFullResponse`     | 获取 [`Response`][Response MDN]。（获取的是原始[`Response`][Response MDN]的克隆）
`fetchAPI`                    | 替换Keq内部包装的[`Fetch API`][FETCH API]。
`resolveWithOriginalResponse` | **废弃** 获取原始的 [`Response`][Response MDN]。在NodeJS中，`node-fetch`的`.clone()`有时候并不能如期望那样运行（根本原因是`highWaterMark`导致的）。在这种情况下可以使用`resolveWithOriginalResponse`获取原始[`Response`][Response MDN]进行处理。但是需要注意，避免重复调用`.json()`，`.text()`等[`Response`][Response MDN]对象的方法。
`highWaterMark`               | **废弃** NodeJS中`Stream`默认情况下会有16KB的限制, `highWaterMark` 当请求体大于16KB时候，需要将这个参数设定为更大的一个数值 (单位: `KB`)。[查看更多Node Fetch说明](https://github.com/node-fetch/node-fetch#custom-highwatermark)。此功能需要`node-fetch@3.0.0-beta.9`支持，需要用户手动设置`fetchAPI`。不过目前不建议使用，因为`node-fetch@3.0.0-beta.9`依旧存在一些问题，例如：某些文件下载请求使用`res.clone().buffer()`并不能正常工作，即便你将`highWaterMark`设定在一个正确值上。

###### 标注**废弃**的字段将在下个大版本中移除

### 中间件

你可以通过中间件来扩展`Keq`。示例如下：

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
  .get('http://test.com')
  .use(middleware)
```

#### request.use(middleware)

添加一个全局的中间件，中间件的运行顺序由`.use()`的调用顺序决定。

#### request.use(host, middleware)

添加一个全局中间件，仅对某一个`host`启用。

#### 开发中间件

中间件必须是一个`async-function`，并且可以接受两个参数，和`koa`的中间件十分相似，中间件函数接受的参数表：

 **Arguments**                                 | **Description**
:----------------------------------------------|:------------------------------------
 `ctx`（第一个参数）                             | Keq上下文对象
 `next`（第二个参数）                            | 调用下一个中间件，最后一个`next()`函数（`Keq`内置）将会发送请求，并将[`Response`][Response MDN]对象添加到`context.res`。千万不要忘记调用`next()`除非你不想发送请求。

Keq的上下文对象有许多可以修改和使用的参数，下面列出了所有`Keq`内置的上下文属性：

**Property**                  | **Type**
:-----------------------------|:------------------------------------
`context.request`             | 发送fetch请求的参数。
`context.request.url`         | 请求地址，是一个`URL`对象，通过`url.parse('http://test.com', true)`创建。
`context.request.method`      | Request method。
`context.request.body`        | 请求体，根据发送请求的不同，其结构可能是：`Object`（json/form-data/x-www-form-urlencoded), Array（json）, Stream（NodeJS发送二进制文件）, Blob（浏览器中发送二进制文件）, undefined（未携带请求体）中的任意一种。
`context.request.headers`     | 请求头[`Headers`][Headers MDN]对象。
`context.request.options`     | 其他[Fetch API][FETCH API]的参数，可以根据需要自己添加。（例如：`ctx.request.options.mode= 'cors'`)
`context.url`                 | 代理 `context.request.url`.
`context.query`               | 代理 `context.request.url.query`.
`context.headers`             | 代理 `context.request.headers`.
`context.body`                | 代理 `context.request.body`.
`context.options`             | Keq的选项值，middleware能够从这里获取自定义参数（example: `context.options.resolveWithFullResponse`）。
`context.res`                 | 原始的[`Response`][Response MDN] 对象. 在调用`await next()`前或者请求出错都可能导致这个值为undefined。
`context.response`            | 通过`ctx.res.clone()`获取的克隆`Response`对象。
`context.output`              | `await request()`的返回值. 默认情况下，`context.output` 是被解析过的响应体， 如果将`options.resolveWithFullResponse`设置为`true`，那么`context.output`的值为`ctx.response`。**此属性只可写入**。

<!-- usage -->

<!-- addition -->

## 常见问题

### `.then()` 和 `.end()` 的区别

这两个方法都是用来发送请求并且返回一个`Promise`对象。两个方法的不同点在于当两个方法被多次调用的时候：

- `.then ()` 仅仅发送一次请求，无论调用多少次。
- `.end ()` 每次调用此方法都将发送一个新的请求

```javascript
import { request } from 'keq'

const keq = request.get('http://test.com')

keq.then(onfulfilled, onrejected)
// Won't send request, and will use the last request result.
keq.then(onfulfilled, onrejected)

keq.end()
keq.end()
```

### `ctx.res` 和 `ctx.response` 的区别

`ctx.response`通过`getter`实现每次取值都能够通过`ctx.res && ctx.res.clone()`创建的新的 [`Response`][Response MDN] 对象。这样每个中间件都可以调`ctx.response.json()`, `ctx.response.text()`, `ctx.response.formData()`，而不会报错。

更重要的是，在`NodeJS`里面，`node-fetch`库没有实现`Response`的`.formData()`方法，在`NodeJS`环境中，`Keq`在克隆`ctx.res`后会自动添加`.formData()`实现。

### 创建可自定义的请求实例

如果你打算自己创建一个请求实例，而不使用全局的`request`实例，可以调用`request.create()`方法：

```typescript
import { request } from 'keq'

const customRequest = request.create()

// Middleware only takes effect on customRequests
customRequest.use(/** some middleware */)

const body = await customRequest
  .get('http://test.com')
```

 > 全局的`request`实例也是调用`request.create()`方法创建的。
 > 因此，自定义的`request`实例也具备全局`request`的所有特性。



## 更多信息

Keq 是受 SuperAgent 和 Koa 这两个优秀的框架启发设计：

- [Superagent](https://visionmedia.github.io/superagent/#test-documentation)
- [Koa](https://koajs.com/)
<!-- addition -->

## 赞助

如果感觉这个库不错，请不要吝啬请我喝杯冰可乐。

[![patron](https://c5.patreon.com/external/logo/become_a_patron_button@2x.png)](https://www.patreon.com/bePatron?u=22478507)

## Contributing & Development

If there is any doubt, it is very welcome to discuss the issue together.
Please read [Contributor Covenant Code of Conduct](.github/CODE_OF_CONDUCT.md) and [CONTRIBUTING](.github/CONTRIBUTING.md).

