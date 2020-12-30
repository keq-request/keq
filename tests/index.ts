import test from 'ava'
import * as sinon from 'sinon'
import { request, Response, Middleware, FormData } from '../src'
import * as url from 'url'


test('JSON Response', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }
  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))

  const urlObj = url.parse('http://test.com', true)
  const uri = url.format(urlObj)

  const body = await request
    .post(uri)
    .query('key1', 'value1')
    .options({ fetchAPI: fakeFetchAPI })

  urlObj.query = { key1: 'value1' }

  // const arg = fakeFetchAPI.getCall(0).args[1]
  t.is(fakeFetchAPI.callCount, 1)
  t.is(url.format({ ...urlObj }), fakeFetchAPI.getCall(0).args[0])
  t.deepEqual(body, JSON.parse(content))
})

test('Form-Data Response', async t => {
  const boundary = '--abcxyz'
  const next = '\r\n'
  const formData = 'Content-Disposition: form-data; '
  const content = `${boundary}${next}${formData}name="key1"${next}${next}value1${next}${boundary}${next}${formData}name="key2"${next}${next}value2${next}${boundary}${next}${formData}name="file1"; filename="a.txt"${next}Content-Type: text/plain${next}${next}Content of a.txt.${next}${boundary}--`

  const responseHeaders = {
    'content-type': `multipart/form-data; boundary=${boundary.slice(2)}`,
    'content-length': String(content.length),
  }
  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))

  const urlObj = url.parse('http://test.com', true)
  const uri = url.format(urlObj)

  const body = await request
    .post(uri)
    .options({ fetchAPI: fakeFetchAPI })

  t.is(fakeFetchAPI.callCount, 1)
  t.is(uri, fakeFetchAPI.getCall(0).args[0])
  t.is('value1', body.get('key1'))
  t.is('value2', body.get('key2'))
  t.is('Content of a.txt.', body.get('file1').__content.toString())
})


test('Form-Data Request', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }
  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))

  const uri = url.format(url.parse('http://test.com'))
  const formData = new FormData()
  formData.append('key3', 'value3')
  formData.append('key3', 'value3')
  const file = Buffer.from('file')

  const body = await request
    .put(uri)
    .type('form-data')
    .field({ key1: 'value1' })
    .field('key2', 'value2')
    .send(formData)
    .attach('file1', file)
    .attach('file2', file, 'file2.txt')
    .attach('file3', file, { filename: 'file3.txt' })
    .option('fetchAPI', fakeFetchAPI)

  const arg = fakeFetchAPI.getCall(0).args[1]

  t.is(fakeFetchAPI.callCount, 1)
  t.is('PUT', arg.method)
  /**
   * To be compatible with node-fetch@2.x
   * body will be a stream when running in NodeJS
   *
   * This will be resolved at node-fetch@3.x
   */
  // t.is('value1', arg.body.get('key1'))
  // t.is('value2', arg.body.get('key2'))
  // t.is('value3', arg.body.get('key3'))
  // t.is('file', arg.body.get('file1').__content.toString())
  t.is(uri, fakeFetchAPI.getCall(0).args[0])
  t.deepEqual(body, JSON.parse(content))
})

test('x-www-form-urlencoded Request', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }
  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))

  const uri = url.format(url.parse('http://test.com'))
  const body = await request
    .del(uri)
    .type('form')
    .send('key1=value1')
    .send({ key2: 'value2' })
    .field('key3', 'value3')
    .option('fetchAPI', fakeFetchAPI)

  const arg = fakeFetchAPI.getCall(0).args[1]

  t.is(fakeFetchAPI.callCount, 1)
  t.is('DELETE', arg.method)
  t.is('value1', arg.body.get('key1'))
  t.is('value2', arg.body.get('key2'))
  t.is('value3', arg.body.get('key3'))
  t.is(uri, fakeFetchAPI.getCall(0).args[0])
  t.deepEqual(body, JSON.parse(content))
})


test('request with basic auth', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }
  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))

  const uri = url.format(url.parse('http://test.com'))

  const body = await request
    .get(uri)
    .auth('username', 'password')
    .option('fetchAPI', fakeFetchAPI)


  const arg = fakeFetchAPI.getCall(0).args[1]
  t.is(fakeFetchAPI.callCount, 1)
  t.is(uri, fakeFetchAPI.getCall(0).args[0])
  t.is('Basic dXNlcm5hbWU6cGFzc3dvcmQ=', arg.headers.get('Authorization'))
  t.deepEqual(body, JSON.parse(content))
})

test('request with middleware', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }
  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))

  const uri = url.format(url.parse('http://test.com'))

  const middleware1: Middleware = async(ctx, next) => {
    const body = ctx.request.body || {}
    body.key1 = 'value1'
    ctx.request.body = body

    await next()
  }

  const middleware2: Middleware = async(ctx, next) => {
    const body = ctx.request.body || {}
    body.key2 = 'value2'
    ctx.request.body = body

    await next()
  }

  const middleware3: Middleware = async(ctx, next) => {
    const body = ctx.request.body || {}
    body.key3 = 'value3'
    ctx.request.body = body
    ctx.request.options.custom = 'custom'

    await next()
  }

  const body = await request
    .get(uri)
    .use('test.com', middleware1)
    .use('not-test.com', middleware2)
    .use(middleware3)
    .option('fetchAPI', fakeFetchAPI)


  const arg = fakeFetchAPI.getCall(0).args[1]
  t.is(fakeFetchAPI.callCount, 1)
  t.is(uri, fakeFetchAPI.getCall(0).args[0])
  t.is('value1', arg.body.key1)
  t.is(undefined, arg.body.key2)
  t.is('value3', arg.body.key3)
  t.is('custom', arg.custom)
  t.deepEqual(body, JSON.parse(content))
})

test('resolveWithFullResponse', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }
  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))

  const urlObj = url.parse('http://test.com', true)
  const uri = url.format(urlObj)

  const res = await request
    .get(uri)
    .options({ fetchAPI: fakeFetchAPI, resolveWithFullResponse: true })


  const body = await res.json()
  // const arg = fakeFetchAPI.getCall(0).args[1]
  t.is(fakeFetchAPI.callCount, 1)
  t.is(uri, fakeFetchAPI.getCall(0).args[0])
  t.deepEqual(body, JSON.parse(content))
})

test('resolveWithOriginalResponse', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }
  const originalResponse = new Response(content, { headers: responseHeaders })
  const fakeFetchAPI = sinon.fake(async() => originalResponse)

  const urlObj = url.parse('http://test.com', true)
  const uri = url.format(urlObj)

  const res = await request
    .get(uri)
    .options({ fetchAPI: fakeFetchAPI, resolveWithOriginalResponse: true })

  const body = await res.json()
  t.is(fakeFetchAPI.callCount, 1)
  t.is(uri, fakeFetchAPI.getCall(0).args[0])
  t.deepEqual(body, JSON.parse(content))
  t.true(res === originalResponse)
})

test('retry request', async t => {
  const fakeFetchAPI = sinon.fake.throws(new Error())
  const fakeCallback = sinon.fake()

  try {
    await request
      .get('http://example.com/')
      .retry(1, fakeCallback)
      .options({ fetchAPI: fakeFetchAPI })
  } catch (e) {}

  t.is(fakeCallback.callCount, 2)
  t.is(fakeFetchAPI.callCount, 2)
})

test('consume response steam multiple times', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }
  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))

  const uri = url.format(url.parse('http://test.com'))

  const consume1: Middleware = async(ctx, next) => {
    await next()
    t.truthy(ctx.response)
    t.notThrows(() => ctx.response && ctx.response.json())
  }
  const consume2: Middleware = async(ctx, next) => {
    await next()
    t.truthy(ctx.response)
    t.notThrows(() => ctx.response && ctx.response.json())
  }


  const res = await request
    .get(uri)
    .use(consume1)
    .use(consume2)
    .option('fetchAPI', fakeFetchAPI)
    .option('resolveWithFullResponse', true)


  await t.notThrowsAsync(res.json())
})
