import { expect, jest, test } from '@jest/globals'
import { Mock } from 'jest-mock'
import { request } from './request.js'
import { sleep } from '@keq-request/test'


test('fire triggers the request', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  const req = request
    .get('http://test.com')

  req.fire()

  await sleep(50)
  expect(mockedFetch.mock.calls).toHaveLength(1)
})

test('fire returns void', () => {
  const req = request
    .get('http://test.com')

  const result = req.fire()

  expect(result).toBeUndefined()
})

test('fire is idempotent', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  const req = request
    .get('http://test.com')

  req.fire()
  req.fire()
  req.fire()

  await sleep(50)
  expect(mockedFetch.mock.calls).toHaveLength(1)
})

test('await after fire resolves with result', async () => {
  const req = request
    .get('http://test.com')

  req.fire()

  const result = await req
  expect(result).toEqual({ code: '200' })
})
