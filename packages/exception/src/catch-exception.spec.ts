import { expect, jest, test } from '@jest/globals'
import { catchException } from './catch-exception'
import { KeqMiddlewareOrchestrator } from 'keq'
import { createMockFetchMiddleware, createSharedContext } from '@keq-request/test'


test('catchException(handler)', async () => {
  const sharedContext = createSharedContext()
  const err = new Error('fetch failed')
  const fetchMiddleware = createMockFetchMiddleware({ error: err })

  const handler = jest.fn((err) => {})
  const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [
    catchException(handler),
    fetchMiddleware,
  ])

  await orchestrator.execute()

  expect(fetchMiddleware).toHaveBeenCalled()
  expect(handler).toHaveBeenCalled()
  expect(handler).toHaveBeenCalledWith(err)
})
