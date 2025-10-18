import { expect, test, describe } from '@jest/globals'
import { Validator } from './validator.js'

describe('Validator', () => {
  describe('isValidHeaderValue', () => {
    test('should validate header values correctly', () => {
      expect(Validator.isHeaderValue('valid')).toBe(true)
      expect(Validator.isHeaderValue('valid\n')).toBe(false)
      expect(Validator.isHeaderValue('测试')).toBe(false)
      expect(Validator.isHeaderValue('')).toBe(true)
    })
  })

  describe('isString', () => {
    test('should return true for strings', () => {
      expect(Validator.isString('')).toBeTruthy()
      expect(Validator.isString('hello')).toBeTruthy()
    })

    test('should return false for non-strings', () => {
      expect(Validator.isString(1)).toBeFalsy()
      expect(Validator.isString({})).toBeFalsy()
    })
  })

  describe('isObject', () => {
    test('should return true for objects', () => {
      expect(Validator.isObject({})).toBeTruthy()
      expect(Validator.isObject([])).toBeTruthy()
      expect(Validator.isObject(new ArrayBuffer(2))).toBeTruthy()
    })

    test('should return false for non-objects', () => {
      expect(Validator.isObject(null)).toBeFalsy()
      expect(Validator.isObject(undefined)).toBeFalsy()
      expect(Validator.isObject('')).toBeFalsy()
      expect(Validator.isObject(1)).toBeFalsy()
    })
  })

  describe('isFunction', () => {
    test('should return true for functions', () => {
      expect(Validator.isFunction(() => {})).toBeTruthy()
      expect(Validator.isFunction(function () {})).toBeTruthy()
    })

    test('should return false for non-functions', () => {
      expect(Validator.isFunction(1)).toBeFalsy()
      expect(Validator.isFunction({})).toBeFalsy()
    })
  })

  describe('isArrayBuffer', () => {
    test('should return true for ArrayBuffer', () => {
      expect(Validator.isArrayBuffer(new ArrayBuffer(2))).toBeTruthy()
    })

    test('should return false for non-ArrayBuffer', () => {
      expect(Validator.isArrayBuffer({})).toBeFalsy()
    })
  })
})
