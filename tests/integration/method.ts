import { test } from '../test.before-each'
import { request } from '../../src'


test('Simple Request', async t => {
  const fetchAPI = t.context.fakeFetchAPI()
  const uri = 'http://test.com/'

  await request({
    url: uri,
    method: 'get',
  }).option('fetchAPI', fetchAPI)

  const args = fetchAPI.getCall(0).args
  t.is(args[0], uri)
  t.is(fetchAPI.callCount, 1)
})


test('GET Request', async t => {
  const fetchAPI = t.context.fakeFetchAPI()

  await request
    .get('http://test.com')
    .option('fetchAPI', fetchAPI)

  const args = fetchAPI.getCall(0).args
  t.is(args[0], 'http://test.com/')
  t.is(args[1]?.method, 'GET')
  t.is(fetchAPI.callCount, 1)
})

test('POST Request', async t => {
  const fetchAPI = t.context.fakeFetchAPI()

  await request
    .post('http://test.com')
    .option('fetchAPI', fetchAPI)

  const args = fetchAPI.getCall(0).args
  t.is(args[0], 'http://test.com/')
  t.is(args[1]?.method, 'POST')
  t.is(fetchAPI.callCount, 1)
})

test('PUT Request', async t => {
  const fetchAPI = t.context.fakeFetchAPI()

  await request
    .put('http://test.com')
    .option('fetchAPI', fetchAPI)


  const args = fetchAPI.getCall(0).args
  t.is(args[0], 'http://test.com/')
  t.is(args[1]?.method, 'PUT')
  t.is(fetchAPI.callCount, 1)
})

test('PATCH Request', async t => {
  const fetchAPI = t.context.fakeFetchAPI()

  await request
    .patch('http://test.com')
    .option('fetchAPI', fetchAPI)

  const args = fetchAPI.getCall(0).args
  t.is(args[0], 'http://test.com/')
  t.is(args[1]?.method, 'PATCH')
  t.is(fetchAPI.callCount, 1)
})

test('HEAD Request', async t => {
  const fetchAPI = t.context.fakeFetchAPI()

  await request
    .head('http://test.com')
    .option('fetchAPI', fetchAPI)

  const args = fetchAPI.getCall(0).args
  t.is(args[0], 'http://test.com/')
  t.is(args[1]?.method, 'HEAD')
  t.is(fetchAPI.callCount, 1)
})

test('DELETE Request', async t => {
  const fetchAPI = t.context.fakeFetchAPI()

  await request
    .delete('http://test.com')
    .option('fetchAPI', fetchAPI)

  const args = fetchAPI.getCall(0).args
  t.is(args[0], 'http://test.com/')
  t.is(args[1]?.method, 'DELETE')
  t.is(fetchAPI.callCount, 1)
})

test('DEL Request', async t => {
  const fetchAPI = t.context.fakeFetchAPI()

  await request
    .del('http://test.com')
    .option('fetchAPI', fetchAPI)

  const args = fetchAPI.getCall(0).args
  t.is(args[0], 'http://test.com/')
  t.is(args[1]?.method, 'DELETE')
  t.is(fetchAPI.callCount, 1)
})
