import { test } from '../test.before-each'
import { request } from '../../src'


test('request with params', async t => {
  const fetchAPI = t.context.fakeFetchAPI()


  await request
    .get('http://test.com/api/:key/value')
    .params('key', 'keq')
    .option('fetchAPI', fetchAPI)

  t.is('http://test.com/api/keq/value', fetchAPI.getCall(0).args[0] as string)
})

test('Request with query', async t => {
  const fetchAPI = t.context.fakeFetchAPI()

  await request
    .get('http://test.com')
    .query('key1', 'value1')
    .query('key2', ['arr_value_1', 'arr_value_2'])
    .query({
      key3: 'value3',
      key4: ['arr_value_3', 'arr_value_4'],
    })
    .option('fetchAPI', fetchAPI)

  t.is(fetchAPI.callCount, 1)
  t.is(fetchAPI.getCall(0).args[0], 'http://test.com/?key1=value1&key2=arr_value_1&key2=arr_value_2&key3=value3&key4=arr_value_3&key4=arr_value_4')
})
