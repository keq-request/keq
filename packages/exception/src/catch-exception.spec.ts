import { expect, jest, test } from '@jest/globals'
import { catchException } from './catch-exception'
import { KeqContext } from 'keq'


test('catchException(handler)', async () => {
  const handler = jest.fn(() => {})
  const middleware = catchException(handler)

  const err = new Error()
  const next = jest.fn(async () => {
    throw err
  })

  const ctx = {} as KeqContext

  await middleware(ctx, next)

  expect(handler).toBeCalled()
  expect(handler).toBeCalledWith(err)
  expect(next).toBeCalled()
})
