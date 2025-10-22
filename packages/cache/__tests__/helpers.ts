import { KeqContext, KeqMiddleware, KeqSharedContext } from 'keq'
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

export function createSharedContext(): KeqSharedContext {
  return new KeqSharedContext({
    request: {
      url: new URL('http://example.com'),
      method: 'get',
      headers: new Headers(),
      routeParams: {},
      body: {},
    },
    options: {},
    global: {},
  })
}


export function createFetchMiddleware(body: string | Error = 'Hello world', delay = 0): Mock<KeqMiddleware> {
  return jest.fn(async (context: KeqContext): Promise<void> => {
    if (body instanceof Error) {
      throw body
    }

    await sleep(delay)

    const response = new Response(body)

    context.res = response
  })
}

