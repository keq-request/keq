import { test } from '../test.before-each'
import { request } from '../../src'


test('JSON ResponseBody', async t => {
  const { fakeFetchAPI } = t.context

  const responseBody = { foo: 'bar' }
  const responseHeaders = {
    'content-type': 'application/json',
  }

  const body = await request
    .post('http://test.com')
    .query('key1', 'value1')
    .options({ fetchAPI: fakeFetchAPI(JSON.stringify(responseBody), responseHeaders) })

  t.deepEqual(body, responseBody)
})

test('Form-Data ResponseBody', async t => {
  const { fakeFetchAPI } = t.context

  const boundary = '--abcxyz'
  const next = '\r\n'
  const formData = 'Content-Disposition: form-data; '
  const responseBody = `${boundary}${next}${formData}name="key1"${next}${next}value1${next}${boundary}${next}${formData}name="key2"${next}${next}value2${next}${boundary}${next}${formData}name="file1"; filename="a.txt"${next}Content-Type: text/plain${next}${next}Content of a.txt.${next}${boundary}--`

  const responseHeaders = {
    'content-type': `multipart/form-data; boundary=${boundary.slice(2)}`,
    'content-length': String(responseBody.length),
  }

  const body = await request
    .post('http://test.com')
    .options({ fetchAPI: fakeFetchAPI(responseBody, responseHeaders) })

  t.is('value1', body.get('key1'))
  t.is('value2', body.get('key2'))
  t.is('Content of a.txt.', await body.get('file1').text())
})
