import { expect, test } from '@jest/globals'
import { base64Decode, base64Encode } from './base64'

test('base64 encode', () => {
  expect(base64Encode('a')).toBe('YQ==')
})

test('base64 decode', () => {
  expect(base64Decode('YQ==')).toBe('a')
})
