import { expect, jest, test } from '@jest/globals'
import { request } from './request.js'
import { sleep } from '@keq-request/test'


test('concurrent flowControl limits parallel requests', async () => {
  let running = 0
  let maxRunning = 0

  const mockedFetch = jest.fn(async () => {
    running++
    if (running > maxRunning) maxRunning = running
    await sleep(100)
    running--
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' },
    })
  })

  async function sendRequest(): Promise<void> {
    await request
      .get('http://test.com')
      .option('fetchAPI', mockedFetch)
      .flowControl('concurrent', 2, 'test-concurrent')
  }

  const promises = Array.from({ length: 4 }, () => sendRequest())
  await Promise.all(promises)

  expect(mockedFetch).toHaveBeenCalledTimes(4)
  expect(maxRunning).toBeLessThanOrEqual(2)
  expect(maxRunning).toBe(2)
})

test('concurrent flowControl with limit 1 behaves like serial', async () => {
  let running = 0
  let maxRunning = 0

  const mockedFetch = jest.fn(async () => {
    running++
    if (running > maxRunning) maxRunning = running
    await sleep(50)
    running--
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' },
    })
  })

  async function sendRequest(): Promise<void> {
    await request
      .get('http://test.com')
      .option('fetchAPI', mockedFetch)
      .flowControl('concurrent', 1, 'test-serial-like')
  }

  const promises = Array.from({ length: 3 }, () => sendRequest())
  await Promise.all(promises)

  expect(mockedFetch).toHaveBeenCalledTimes(3)
  expect(maxRunning).toBe(1)
})
