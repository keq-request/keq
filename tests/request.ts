import test from 'ava'
import sinon from 'sinon'
import { request, Response } from '../src'


test('Simple Request', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }

  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))
  const uri = 'http://test.com/'

  await request({
    url: uri,
    method: 'get',
  }).option('fetchAPI', fakeFetchAPI)

  t.is(fakeFetchAPI.callCount, 1)
  t.is(uri, fakeFetchAPI.getCall(0).args[0])
})


test('GET Request', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }

  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))

  await request
    .get('http://example.com')
    .option('fetchAPI', fakeFetchAPI)

  const arg = fakeFetchAPI.getCall(0).args[1]
  t.is(fakeFetchAPI.callCount, 1)
  t.is('GET', arg.method)
  t.is('http://example.com/', fakeFetchAPI.getCall(0).args[0])
})

test('POST Request', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }

  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))

  await request
    .post('http://example.com')
    .option('fetchAPI', fakeFetchAPI)

  const arg = fakeFetchAPI.getCall(0).args[1]

  t.is(fakeFetchAPI.callCount, 1)
  t.is('POST', arg.method)
  t.is('http://example.com/', fakeFetchAPI.getCall(0).args[0])
})

test('PUT Request', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }

  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))

  await request
    .put('http://example.com')
    .option('fetchAPI', fakeFetchAPI)

  const arg = fakeFetchAPI.getCall(0).args[1]

  t.is(fakeFetchAPI.callCount, 1)
  t.is('PUT', arg.method)
  t.is('http://example.com/', fakeFetchAPI.getCall(0).args[0])
})

test('PATCH Request', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }

  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))

  await request
    .patch('http://example.com')
    .option('fetchAPI', fakeFetchAPI)

  const arg = fakeFetchAPI.getCall(0).args[1]
  t.is(fakeFetchAPI.callCount, 1)
  t.is('PATCH', arg.method)
  t.is('http://example.com/', fakeFetchAPI.getCall(0).args[0])
})

test('HEAD Request', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }

  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))

  await request
    .head('http://example.com')
    .option('fetchAPI', fakeFetchAPI)

  const arg = fakeFetchAPI.getCall(0).args[1]
  t.is(fakeFetchAPI.callCount, 1)
  t.is('HEAD', arg.method)
  t.is('http://example.com/', fakeFetchAPI.getCall(0).args[0])
})


test('DELETE Request', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }

  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))

  await request
    .delete('http://example.com')
    .option('fetchAPI', fakeFetchAPI)

  const arg = fakeFetchAPI.getCall(0).args[1]
  t.is(fakeFetchAPI.callCount, 1)
  t.is('DELETE', arg.method)
  t.is('http://example.com/', fakeFetchAPI.getCall(0).args[0])
})

test('DEL Request', async t => {
  const content = '{}'
  const responseHeaders = {
    'content-type': 'application/json',
  }

  const fakeFetchAPI = sinon.fake(async() => new Response(content, { headers: responseHeaders }))

  await request
    .del('http://example.com')
    .option('fetchAPI', fakeFetchAPI)

  const arg = fakeFetchAPI.getCall(0).args[1]
  t.is(fakeFetchAPI.callCount, 1)
  t.is('DELETE', arg.method)
  t.is('http://example.com/', fakeFetchAPI.getCall(0).args[0])
})
