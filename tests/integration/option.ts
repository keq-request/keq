import { test } from '../test.before-each'
import * as sinon from 'sinon'
import { request, Response, Middleware } from '../../src'
import * as url from 'url'
import * as R from 'ramda'


test('request with basic auth', async t => {
  const fetchAPI = t.context.fakeFetchAPI()

  await request
    .get('http://test.com')
    .auth('username', 'password')
    .option('fetchAPI', fetchAPI)


  const arg = fetchAPI.getCall(0).args[1]
  const headers = arg?.headers as Headers
  t.is('Basic dXNlcm5hbWU6cGFzc3dvcmQ=', headers.get('Authorization') as string)
})

test.only('request with middleware', async t => {
  const fetchAPI = t.context.fakeFetchAPI()

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

  await request.create()
    .get('http://test.com')
    .use('test.com', middleware1)
    .use('not-test.com', middleware2)
    .use(middleware3)
    .option('fetchAPI', fetchAPI)


  const arg = fetchAPI.getCall(0).args[1]
  const argBody = JSON.parse(arg?.body as string)

  t.is(fetchAPI.callCount, 1)
  t.is('value1', argBody.key1)
  t.is(undefined, argBody.key2)
  t.is('value3', argBody.key3)
  t.is('custom', arg?.['custom'])
})

test('resolveWithFullResponse', async t => {
  const responseBody = '{"key1": "value1"}'
  const fetchAPI = t.context.fakeFetchAPI(responseBody)

  const urlObj = url.parse('http://test.com', true)
  const uri = url.format(urlObj)

  const res = await request
    .get(uri)
    .options({
      fetchAPI,
      resolveWithFullResponse: true,
    })


  const body = await res.json()
  t.is(fetchAPI.callCount, 1)
  t.deepEqual(body, JSON.parse(responseBody))
})

test('resolveWithOriginalResponse', async t => {
  const responseBody = '{}'
  const fetchAPI = t.context.fakeFetchAPI(responseBody)

  const urlObj = url.parse('http://test.com', true)
  const uri = url.format(urlObj)

  const res = await request
    .get(uri)
    .options({ fetchAPI, resolveWithOriginalResponse: true })

  const body = await res.json()
  t.deepEqual(body, JSON.parse(responseBody))
})

test('retry twice request', async t => {
  const fakeFetchAPI = sinon.fake.throws(new Error())
  const fakeCallback = sinon.fake()

  try {
    await request
      .get('http://test.com')
      .retry(1, fakeCallback)
      .options({ fetchAPI: fakeFetchAPI })
  } catch (e) {}

  t.is(fakeCallback.callCount, 2)
  t.is(fakeFetchAPI.callCount, 2)
})

test('stop retry request', async t => {
  const fakeFetchAPI = sinon.fake.throws(new Error())
  const fakeCallback = sinon.fake(() => false)

  try {
    await request
      .get('http://test.com')
      .retry(1, fakeCallback)
      .options({ fetchAPI: fakeFetchAPI })
  } catch (e) {}

  t.is(fakeCallback.callCount, 1)
  t.is(fakeFetchAPI.callCount, 1)
})

test('consume response steam multiple times', async t => {
  // response body large than 1MB
  const content = JSON.stringify({
    key: R.repeat('x', 1024 * 1024).join(''),
  })
  const responseHeaders = {
    'content-type': 'application/json',
  }
  const fakeFetchAPI = sinon.fake(() => new Response(content, { headers: responseHeaders }))


  const consume1: Middleware = async(ctx, next) => {
    await next()
    t.truthy(ctx.response)
    t.notThrows(() => ctx.response && ctx.response.json())
  }
  const consume2: Middleware = async(ctx, next) => {
    await next()
    t.truthy(ctx.response)
    t.notThrows(() => ctx.response && ctx.response.text())
  }


  const res = await request
    .get('http://test.com')
    .use(consume1)
    .use(consume2)
    .option('fetchAPI', fakeFetchAPI)
    .option('resolveWithFullResponse', true)


  await t.notThrowsAsync(res.json())
})

