import { expect, test } from '@jest/globals'
import { createResponseProxy } from './create-response-proxy'


test('createResponseProxy(new Response())', async () => {
  const res = new Response('hello world')
  const proxy = createResponseProxy(res)

  expect(proxy).toBeInstanceOf(Response)
  expect(proxy).not.toBe(res)
  expect(await proxy.text()).toBe('hello world')
})
