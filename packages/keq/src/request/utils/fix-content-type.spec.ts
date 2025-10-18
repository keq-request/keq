import { expect, test } from '@jest/globals'
import { fixContentType } from './fix-content-type'

test('fix "json" to "application/json"', () => {
  expect(fixContentType('json')).toBe('application/json')
})

test('fix "application/json" to "application/json"', () => {
  expect(fixContentType('application/json')).toBe('application/json')
})

test('fix "svg" to "image/svg+xml"', () => {
  expect(fixContentType('svg')).toBe('image/svg+xml')
})

test('fix "html" to "text/html"', () => {
  expect(fixContentType('html')).toBe('text/html')
})

test('fix "jpeg" to "image/jpeg"', () => {
  expect(fixContentType('jpeg')).toBe('image/jpeg')
})
