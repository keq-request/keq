import { AsyncLocalStorage } from 'node:async_hooks'
import { expect, test } from '@jest/globals'
import { Keq, KeqRequest } from '~/request'
import { sleep } from '@keq-request/test'


interface Store {
  id: string
}

/**
 * Sends `total` requests, each from its own AsyncLocalStorage context, and
 * reports what each request observed once it reached the bottom of the chain.
 *
 * @description
 * 每个请求在各自的 ALS 上下文中发起，在 `fetchAPI`（终端中间件，位于流控队列
 * 下游）中读取上下文。期望每一项都等于该请求自己的 id —— 队列中排队的请求
 * 不应继承上一个请求的上下文。
 */
async function collectObservedIds(
  total: number,
  applyFlowControl: (keq: Keq) => unknown,
): Promise<Record<string, string | undefined>> {
  const als = new AsyncLocalStorage<Store>()
  const observed: Record<string, string | undefined> = {}
  // A dedicated instance keeps flow-control state out of other test files
  const request = new KeqRequest()

  const ids = Array.from({ length: total }, (_, index) => `req-${index}`)

  await Promise.all(ids.map((id) => als.run({ id }, async () => {
    const keq = request
      .get('http://test.com')
      .option('fetchAPI', async () => {
        // Read the context downstream of the flow-control queue
        observed[id] = als.getStore()?.id
        await sleep(20)
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'content-type': 'application/json' },
        })
      })

    applyFlowControl(keq)
    await keq
  })))

  expect(Object.keys(observed)).toHaveLength(total)

  return observed
}

function expectSelfObserved(observed: Record<string, string | undefined>, total: number): void {
  const expected: Record<string, string> = {}
  for (let index = 0; index < total; index++) {
    expected[`req-${index}`] = `req-${index}`
  }

  expect(observed).toEqual(expected)
}

test('serial flowControl preserves the AsyncLocalStorage context of each request', async () => {
  const observed = await collectObservedIds(4, (keq) => keq.flowControl('serial', 'als-serial'))
  expectSelfObserved(observed, 4)
})

test('concurrent flowControl with limit 1 preserves the AsyncLocalStorage context', async () => {
  const observed = await collectObservedIds(3, (keq) => keq.flowControl('concurrent', 1, 'als-concurrent-1'))
  expectSelfObserved(observed, 3)
})

test('concurrent flowControl with limit 2 preserves the AsyncLocalStorage context', async () => {
  // 5 requests over a limit of 2: the 3rd onwards are queued, which is exactly
  // where the previous fastq-based implementation leaked the prior context.
  const observed = await collectObservedIds(5, (keq) => keq.flowControl('concurrent', 2, 'als-concurrent-2'))
  expectSelfObserved(observed, 5)
})

test('serial flowControl keeps FIFO order', async () => {
  const request = new KeqRequest()
  const started: string[] = []

  const ids = ['a', 'b', 'c', 'd', 'e']

  await Promise.all(ids.map((id) => request
    .get('http://test.com')
    .option('fetchAPI', async () => {
      started.push(id)
      await sleep(10)
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'content-type': 'application/json' },
      })
    })
    .flowControl('serial', 'als-serial-fifo')))

  expect(started).toEqual(ids)
})

test('a failing request does not deadlock the serial queue', async () => {
  const request = new KeqRequest()
  const reached: string[] = []

  const results = await Promise.allSettled(['a', 'b', 'c', 'd'].map((id) => request
    .get('http://test.com')
    .option('fetchAPI', async () => {
      if (id === 'b') throw new Error('boom')
      reached.push(id)
      await sleep(5)
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'content-type': 'application/json' },
      })
    })
    .flowControl('serial', 'als-serial-deadlock')))

  expect(reached).toEqual(['a', 'c', 'd'])
  expect(results.map((result) => result.status)).toEqual(['fulfilled', 'rejected', 'fulfilled', 'fulfilled'])
})
