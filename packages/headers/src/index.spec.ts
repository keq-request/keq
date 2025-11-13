import { expect, test } from '@jest/globals'
import { KeqMiddlewareOrchestrator } from 'keq'
import { setHeader, setHeaders, appendHeader, appendHeaders, insertHeader, insertHeaders } from './index'
import { createMockFetchMiddleware, createSharedContext } from '@keq-request/test'


test('setHeader', async () => {
  const fetchMiddleware = createMockFetchMiddleware()
  const sharedContext = createSharedContext()

  const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [
    setHeader('x-test', 'test'),
    fetchMiddleware,
  ])

  await orchestrator.execute()

  expect(sharedContext.request.headers.get('x-test')).toBe('test')
  expect(fetchMiddleware).toHaveBeenCalled()
})

test('setHeaders', async () => {
  const fetchMiddleware = createMockFetchMiddleware()
  const sharedContext = createSharedContext()

  const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [
    setHeaders({
      'x-test1': 'test1',
      'x-test2': 'test2',
    }),
    fetchMiddleware,
  ])

  await orchestrator.execute()

  expect(sharedContext.request.headers.get('x-test1')).toBe('test1')
  expect(sharedContext.request.headers.get('x-test2')).toBe('test2')
  expect(fetchMiddleware).toHaveBeenCalled()
})


test('appendHeader', async () => {
  const fetchMiddleware = createMockFetchMiddleware()
  const sharedContext = createSharedContext({
    request: {
      headers: new Headers({ 'x-append': 'initial' }),
    },
  })

  const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [
    appendHeader('x-append', 'appended'),
    fetchMiddleware,
  ])

  await orchestrator.execute()

  expect(sharedContext.request.headers.get('x-append')).toBe('initial, appended')
  expect(fetchMiddleware).toHaveBeenCalled()
})

test('appendHeaders', async () => {
  const fetchMiddleware = createMockFetchMiddleware()
  const sharedContext = createSharedContext({
    request: {
      headers: new Headers({
        'x-append1': 'initial1',
        'x-append2': 'initial2',
      }),
    },
  })

  const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [
    appendHeaders({
      'x-append1': 'appended1',
      'x-append2': 'appended2',
    }),
    fetchMiddleware,
  ])

  await orchestrator.execute()


  expect(sharedContext.request.headers.get('x-append1')).toBe('initial1, appended1')
  expect(sharedContext.request.headers.get('x-append2')).toBe('initial2, appended2')
  expect(fetchMiddleware).toHaveBeenCalled()
})

test('insertHeader', async () => {
  const fetchMiddleware = createMockFetchMiddleware()
  const sharedContext = createSharedContext({
    request: {
      headers: new Headers({
        'x-insert': 'exists',
      }),
    },
  })

  const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [
    insertHeader('x-insert', 'new'),
    insertHeader('x-new', 'inserted'),
    fetchMiddleware,
  ])

  await orchestrator.execute()

  expect(sharedContext.request.headers.get('x-insert')).toBe('exists')
  expect(sharedContext.request.headers.get('x-new')).toBe('inserted')
  expect(fetchMiddleware).toHaveBeenCalled()
})

test('insertHeaders', async () => {
  const fetchMiddleware = createMockFetchMiddleware()
  const sharedContext = createSharedContext({
    request: {
      headers: new Headers({
        'x-insert1': 'exists1',
      }),
    },
  })

  const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [
    insertHeaders({
      'x-insert1': 'new1',
      'x-insert2': 'new2',
    }),
    fetchMiddleware,
  ])

  await orchestrator.execute()

  expect(sharedContext.request.headers.get('x-insert1')).toBe('exists1')
  expect(sharedContext.request.headers.get('x-insert2')).toBe('new2')
  expect(fetchMiddleware).toHaveBeenCalled()
})
