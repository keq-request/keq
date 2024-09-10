/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from '@jest/globals'
import { composeMiddleware } from './compose-middleware.js'
import { KeqMiddleware } from '~/types/keq-middleware.js'

test('compose empty route', () => {
  expect(() => composeMiddleware([])).toThrowError()
})

test('forget await when calling next', async () => {
  function m1(): KeqMiddleware {
    return async function m1(ctx, next) {
      // forget await
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      next()
    }
  }

  // TODO: Global Error Test Case
  // function m2(): KeqMiddleware {
  //   return async function m2(ctx, next) {
  //     void (async () => {
  //       await new Promise((resolve) => setTimeout(resolve, 100))
  //       await next()
  //     })()
  //   }
  // }

  function m3(): KeqMiddleware {
    return async function m2(ctx, next) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      await next()
    }
  }

  await expect(
    composeMiddleware([
      m1(),
      m3(),
    ])({} as any, () => {}),
  ).rejects.toThrowError()

  // await expect(
  //   composeMiddleware([
  //     m2(),
  //     m3(),
  //   ])({} as any, () => {})
  // ).rejects.toThrowError()

  await expect(
    composeMiddleware([
      m3(),
    ])({} as any, () => {}),
  ).resolves.not.toThrowError()
})
