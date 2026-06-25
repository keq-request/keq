import { expect, test } from '@jest/globals'
import { isObject } from './is-object'

test('isObject', async () => {
  expect(isObject({})).toBeTruthy()
  expect(isObject([])).toBeTruthy()
  expect(isObject(new ArrayBuffer(2))).toBeTruthy()
  expect(isObject(new ReadableStream())).toBeTruthy()
  expect(isObject(null)).toBeFalsy()
  expect(isObject(undefined)).toBeFalsy()
  expect(isObject('')).toBeFalsy()
  expect(isObject(1)).toBeFalsy()
})
