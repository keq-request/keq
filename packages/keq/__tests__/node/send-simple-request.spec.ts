import { expect, test } from '@jest/globals'
import { Mock } from 'jest-mock'
import { request } from './request.js'


test('send get request', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  await request
    .get('http://test.com')


  expect(mockedFetch.mock.calls).toHaveLength(1)

  const url = mockedFetch.mock.calls[0][0]
  const init = mockedFetch.mock.calls[0][1]

  expect(url).toBe('http://test.com/')
  expect(init?.method).toBe('GET')
})


test('send post request', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  await request
    .post('http://test.com')

  expect(mockedFetch.mock.calls).toHaveLength(1)

  const url = mockedFetch.mock.calls[0][0]
  const init = mockedFetch.mock.calls[0][1]

  expect(url).toBe('http://test.com/')
  expect(init?.method).toBe('POST')

  expect(init?.headers).toBeInstanceOf(Headers)

  const headers = init?.headers as Headers
  expect(headers.get('content-type')).toBeNull()
})

test('send put request', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  await request
    .put('http://test.com')

  expect(mockedFetch.mock.calls).toHaveLength(1)

  const url = mockedFetch.mock.calls[0][0]
  const init = mockedFetch.mock.calls[0][1]

  expect(url).toBe('http://test.com/')
  expect(init?.method).toBe('PUT')

  expect(init?.headers).toBeInstanceOf(Headers)

  const headers = init?.headers as Headers
  expect(headers.get('content-type')).toBeNull()
})

test('send patch request', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  await request
    .patch('http://test.com')

  expect(mockedFetch.mock.calls).toHaveLength(1)

  const url = mockedFetch.mock.calls[0][0]
  const init = mockedFetch.mock.calls[0][1]

  expect(url).toBe('http://test.com/')
  expect(init?.method).toBe('PATCH')

  expect(init?.headers).toBeInstanceOf(Headers)

  const headers = init?.headers as Headers
  expect(headers.get('content-type')).toBeNull()
})

test('send head request', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  await request
    .head('http://test.com')

  expect(mockedFetch.mock.calls).toHaveLength(1)

  const url = mockedFetch.mock.calls[0][0]
  const init = mockedFetch.mock.calls[0][1]

  expect(url).toBe('http://test.com/')
  expect(init?.method).toBe('HEAD')

  expect(init?.headers).toBeInstanceOf(Headers)

  const headers = init?.headers as Headers
  expect(headers.get('content-type')).toBeNull()
})

test('send DELETE request', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  await request
    .del('http://test.com')

  expect(mockedFetch.mock.calls).toHaveLength(1)

  const url = mockedFetch.mock.calls[0][0]
  const init = mockedFetch.mock.calls[0][1]

  expect(url).toBe('http://test.com/')
  expect(init?.method).toBe('DELETE')

  expect(init?.headers).toBeInstanceOf(Headers)

  const headers = init?.headers as Headers
  expect(headers.get('content-type')).toBeNull()
})
