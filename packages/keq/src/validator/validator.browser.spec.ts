import { expect, test, describe } from '@jest/globals'
import { Validator } from './validator'

describe('Validator (Browser)', () => {
  describe('isBuffer', () => {
    test('should return false for all inputs in browser', () => {
      expect(Validator.isBuffer(Buffer.from(''))).toBe(false)
      expect(Validator.isBuffer(new Uint8Array())).toBe(false)
      expect(Validator.isBuffer('')).toBe(false)
      expect(Validator.isBuffer(0)).toBe(false)
      expect(Validator.isBuffer(null)).toBe(false)
    })
  })
})
