import { expect, test } from '@jest/globals'
import { isBuffer } from './is-buffer'

test('isBuffer', () => {
  expect(isBuffer(Buffer.from(''))).toBe(true)
  expect(isBuffer(new Uint8Array())).toBe(false)
  expect(isBuffer('')).toBe(false)
  expect(isBuffer(0)).toBe(false)
  expect(isBuffer(null)).toBe(false)
})
