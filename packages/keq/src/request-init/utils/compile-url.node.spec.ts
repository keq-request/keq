import { expect, test } from '@jest/globals'
import { compileUrl } from './compile-url.js'

test('compile-pathname-template', () => {
  expect(compileUrl('http://example.com/api/{id}', { id: '1' }).href).toBe('http://example.com/api/1')
  expect(compileUrl('http://example.com/api/i{id}i', { id: '1' }).href).toBe('http://example.com/api/i1i')
  expect(compileUrl('http://example.com/api/{id}i', { id: '1' }).href).toBe('http://example.com/api/1i')
  expect(compileUrl('http://example.com/api/%7Bid%7D', { id: '1' }).href).toBe('http://example.com/api/1')
  expect(compileUrl('http://example.com/api/{id}', {}).href).toBe('http://example.com/api/')
  expect(compileUrl('http://example.com/api/%7Bid%7D', {}).href).toBe('http://example.com/api/')
})
