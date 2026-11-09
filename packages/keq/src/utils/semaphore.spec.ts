import { expect, test } from '@jest/globals'
import { Semaphore } from './semaphore'
import { sleep } from './sleep'


test('constructor rejects invalid concurrency', () => {
  expect(() => new Semaphore(0)).toThrow(TypeError)
  expect(() => new Semaphore(-1)).toThrow(TypeError)
  expect(() => new Semaphore(1.5)).toThrow(TypeError)
})

test('limits concurrency', async () => {
  const semaphore = new Semaphore(2)
  let running = 0
  let maxRunning = 0

  await Promise.all(Array.from({ length: 6 }, async () => {
    await semaphore.acquire()
    running++
    if (running > maxRunning) maxRunning = running

    try {
      await sleep(10)
    } finally {
      running--
      semaphore.release()
    }
  }))

  expect(maxRunning).toBe(2)
})

test('runs waiters in FIFO order', async () => {
  const semaphore = new Semaphore(1)
  const finished: string[] = []

  await Promise.all(['a', 'b', 'c', 'd', 'e'].map(async (id) => {
    await semaphore.acquire()

    try {
      await sleep(5)
      finished.push(id)
    } finally {
      semaphore.release()
    }
  }))

  expect(finished).toEqual(['a', 'b', 'c', 'd', 'e'])
})

test('a rejected task does not deadlock the remaining waiters', async () => {
  const semaphore = new Semaphore(1)
  const finished: string[] = []

  const results = await Promise.allSettled(['a', 'b', 'c', 'd'].map(async (id) => {
    await semaphore.acquire()

    try {
      await sleep(5)
      if (id === 'b') throw new Error('boom')
      finished.push(id)
    } finally {
      semaphore.release()
    }
  }))

  expect(finished).toEqual(['a', 'c', 'd'])
  expect(results.map((result) => result.status)).toEqual(['fulfilled', 'rejected', 'fulfilled', 'fulfilled'])
})

test('extra release() calls do not inflate the available slots', async () => {
  const semaphore = new Semaphore(1)

  // Releasing without a matching acquire() must not raise the concurrency limit
  semaphore.release()
  semaphore.release()

  let running = 0
  let maxRunning = 0

  await Promise.all(Array.from({ length: 4 }, async () => {
    await semaphore.acquire()
    running++
    if (running > maxRunning) maxRunning = running

    try {
      await sleep(5)
    } finally {
      running--
      semaphore.release()
    }
  }))

  expect(maxRunning).toBe(1)
})
