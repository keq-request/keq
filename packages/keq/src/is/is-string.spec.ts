import { expect, test } from '@jest/globals'
import { isString } from './is-string'

test('isString', async () => {
  expect(isString('')).toBeTruthy()
  expect(isString(1)).toBeFalsy()
  expect(isString({})).toBeFalsy()
})
