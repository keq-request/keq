import { expect, test } from '@jest/globals'
import { isFunction } from './is-function'

test('isFunction', async () => {
  expect(isFunction(() => {})).toBeTruthy()
  expect(isFunction(1)).toBeFalsy()
  expect(isFunction({})).toBeFalsy()
})
