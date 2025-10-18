import { expect, test, describe } from '@jest/globals'
import { Validator } from './validator'

describe('Validator (Node)', () => {
  describe('isBuffer', () => {
    test('should return true for Buffer', () => {
      expect(Validator.isBuffer(Buffer.from(''))).toBe(true)
    })

    test('should return false for non-Buffer', () => {
      expect(Validator.isBuffer(new Uint8Array())).toBe(false)
      expect(Validator.isBuffer('')).toBe(false)
      expect(Validator.isBuffer(0)).toBe(false)
      expect(Validator.isBuffer(null)).toBe(false)
    })
  })

  describe('isReadableStream', () => {
    test('should return true for ReadableStream', () => {
      expect(Validator.isReadableStream(new ReadableStream())).toBeTruthy()
    })

    test('should return false for non-ReadableStream', () => {
      expect(Validator.isReadableStream({})).toBeFalsy()
    })
  })

  describe('isObject', () => {
    test('should return true for ReadableStream', () => {
      expect(Validator.isObject(new ReadableStream())).toBeTruthy()
    })
  })

  describe('isBlob', () => {
    test('should return true for Blob', () => {
      const blob = new Blob(['a'])
      expect(Validator.isBlob(blob)).toBeTruthy()
    })

    test('should return false for non-Blob', () => {
      expect(Validator.isBlob({})).toBeFalsy()
    })
  })

  describe('isFile', () => {
    test('should return true for File', () => {
      const file = new File(['a'], 'a.txt')
      expect(Validator.isFile(file)).toBeTruthy()
    })

    test('should return false for non-File', () => {
      expect(Validator.isFile({})).toBeFalsy()
    })
  })

  describe('isFormData', () => {
    test('should return true for FormData', () => {
      const formData = new FormData()
      expect(Validator.isFormData(formData)).toBeTruthy()
    })

    test('should return false for non-FormData', () => {
      expect(Validator.isFormData({})).toBeFalsy()
    })
  })

  describe('isHeaders', () => {
    test('should return true for Headers', () => {
      expect(Validator.isHeaders(new Headers())).toBeTruthy()
    })

    test('should return false for non-Headers', () => {
      expect(Validator.isHeaders({})).toBeFalsy()
    })
  })

  describe('isUrlSearchParams', () => {
    test('should return true for URLSearchParams', () => {
      const urlSearchParams = new URLSearchParams()
      expect(Validator.isUrlSearchParams(urlSearchParams)).toBeTruthy()
    })

    test('should return false for non-URLSearchParams', () => {
      expect(Validator.isUrlSearchParams({})).toBeFalsy()
    })
  })
})
