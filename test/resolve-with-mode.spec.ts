import { expect, test } from '@jest/globals'
import { request } from '~/index.js'


test('resolve response body by text', async () => {
  const result = await request
    .get('http://test.com')
    .auth('username', 'password')
    .resolveWith('text')

  expect(result).toEqual('{"code":"200"}')
})

test('resolve response body by json', async () => {
  const result = await request
    .get('http://test.com')
    .auth('username', 'password')
    .resolveWith<{ code: string }>('json')

  expect(result).toEqual({ code: '200' })
})

test('resolve response body by blob', async () => {
  const result = await request
    .get('http://test.com')
    .auth('username', 'password')
    .resolveWith('blob')

  expect(result).toBeInstanceOf(Blob)
})

test('resolve response body by arrayBuffer', async () => {
  const result = await request
    .get('http://test.com')
    .auth('username', 'password')
    .resolveWith('array-buffer')

  expect(result).toBeInstanceOf(ArrayBuffer)
})

test('resolve response body', async () => {
  const result = await request
    .get('http://test.com')
    .auth('username', 'password')
    .resolveWith('response')

  expect(result).toBeInstanceOf(Response)
})
