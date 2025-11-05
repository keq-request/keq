import { describe, expect, test } from '@jest/globals'
import { setBaseUrl, setOrigin, setHost } from './index.js'
import { KeqMiddlewareOrchestrator } from 'keq'
import { createMockFetchMiddleware, createSharedContext } from 'keq-test'


describe('setBaseUrl', () => {
  test('Replace url', async () => {
    const sharedContext = createSharedContext({
      request: {
        url: new URL('http://example.com/test'),
      },
    })
    const fetchMiddleware = createMockFetchMiddleware()

    const orchestrator = new KeqMiddlewareOrchestrator(
      sharedContext,
      [
        setBaseUrl('https://test.com/api'),
        fetchMiddleware,
      ],
    )

    await orchestrator.execute()

    expect(sharedContext.request.url.href).toBe('https://test.com/api/test')
    expect(fetchMiddleware).toHaveBeenCalledTimes(1)
  })

  test('Prefix pathname', async () => {
    const sharedContext = createSharedContext({
      request: {
        url: new URL('http://example.com/test'),
      },
    })
    const fetchMiddleware = createMockFetchMiddleware()

    const orchestrator = new KeqMiddlewareOrchestrator(
      sharedContext,
      [
        setBaseUrl('/api'),
        fetchMiddleware,
      ],
    )

    await orchestrator.execute()

    expect(sharedContext.request.url.href).toBe('http://example.com/api/test')
    expect(fetchMiddleware).toHaveBeenCalledTimes(1)
  })
})


test('setOrigin', async () => {
  const context = createSharedContext({
    request: {
      url: new URL('http://example.com/test'),
    },
  })
  const fetchMiddleware = createMockFetchMiddleware()
  const orchestrator = new KeqMiddlewareOrchestrator(
    context,
    [
      setOrigin('https://test.com/api'),
      fetchMiddleware,
    ],
  )
  await orchestrator.execute()

  expect(context.request.url.href).toBe('https://test.com/test')
  expect(fetchMiddleware).toHaveBeenCalledTimes(1)
})

test('setHost', async () => {
  const context = createSharedContext({
    request: {
      url: new URL('http://example.com/test'),
    },
  })

  const fetchMiddleware = createMockFetchMiddleware()

  const orchestrator = new KeqMiddlewareOrchestrator(context, [
    setHost('test.com'),
    fetchMiddleware,
  ])

  await orchestrator.execute()

  expect(context.request.url.href).toBe('http://test.com/test')
  expect(fetchMiddleware).toHaveBeenCalledTimes(1)
})
