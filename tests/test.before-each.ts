/* eslint-disable @typescript-eslint/no-unused-vars */
import anyTest, { TestFn } from 'ava'
import * as sinon from 'sinon'
import { Response } from '../src'


export const test = anyTest as TestFn<{
  fakeFetchAPI: (responseBody?, responseHeaders?) => sinon.SinonSpy<Parameters<typeof fetch>, ReturnType<typeof fetch>>
}>

test.beforeEach(t => {
  const defaultResponseBody = JSON.stringify({ foo: 'bar' })
  const defaultResponseHeaders = {
    'content-type': 'application/json',
  }
  t.context.fakeFetchAPI = (responseBody = defaultResponseBody, responseHeaders = defaultResponseHeaders) => sinon.fake((input: RequestInfo, init?: RequestInit) => Promise.resolve(new Response(responseBody, { headers: responseHeaders })))
})
