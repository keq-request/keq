import { expect, test } from '@jest/globals'
import { isValidHeaderValue } from './is-valid-header-value'


test('isValidHeaderValue', () => {
  expect(isValidHeaderValue('valid')).toBe(true)
  expect(isValidHeaderValue('valid\n')).toBe(false)
  expect(isValidHeaderValue('测试')).toBe(false)
  expect(isValidHeaderValue('')).toBe(true)
})
