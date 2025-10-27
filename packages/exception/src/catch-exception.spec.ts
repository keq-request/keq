import { expect, jest, test } from '@jest/globals'
import { catchException } from './catch-exception'
import { KeqMiddlewareOrchestrator } from 'keq'
import { createMockFetchMiddleware, createSharedContext } from 'keq-test'


test('catchException(handler)', async () => {
  const sharedContext = createSharedContext()
  const err = new Error('fetch failed')
  const fetchMiddleware = createMockFetchMiddleware({ error: err })

  const handler = jest.fn(() => {})
  const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [
    catchException(handler),
    fetchMiddleware,
  ])

  await orchestrator.execute()

  expect(fetchMiddleware).toBeCalled()
  expect(handler).toBeCalled()
  expect(handler).toBeCalledWith(err)
})
