import { createResponseProxy, KeqContext, KeqNext } from 'keq'
import { Mock } from 'jest-mock'
import { jest } from '@jest/globals'


export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}


export function createResponse(options: { size: number }): Response {
  const str = new Array(options.size)
    .fill('a')
    .join('')

  return new Response(str, {
    status: 200,
    headers: new Headers({
      'content-length': String(options.size),
    }),
  })
}


export function createKeqContext(): KeqContext {
  return {
    metadata: {
      finished: false,
      entryNextTimes: 0,
      outNextTimes: 0,
    },
    request: {
      url: new URL('http://example.com'),
      method: 'get',
      headers: new Headers({
        'x-insert1': 'exists1',
      }),
      routeParams: {},
      body: {},
    },
    options: {},
    global: {},
  } as unknown as KeqContext
}

export function createKeqNext(context: KeqContext, body: string | Error = 'Hello world'): Mock<KeqNext> {
  const next = jest.fn(async () => {
    if (body instanceof Error) {
      throw body
    }

    const response = new Response(body)

    context.res = response
    context.response = createResponseProxy(response)
  })

  return next
}
