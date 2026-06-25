import { expect, test } from '@jest/globals'
import { isArrayBuffer } from 'util/types'

test('isArrayBuffer', () => {
  expect(isArrayBuffer(new ArrayBuffer(2))).toBeTruthy()
  expect(isArrayBuffer({})).toBeFalsy()
})
