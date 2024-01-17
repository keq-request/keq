import { expect, test } from '@jest/globals'
import { compilePathnameTemplate } from './compile-pathname-template.js'

test('compile-pathname-template', () => {
  expect(compilePathnameTemplate('/api/:id', { id: '1' })).toBe('/api/1')
  expect(compilePathnameTemplate('/api/:idx', { id: '1' })).toBe('/api/:idx')
  expect(compilePathnameTemplate('/api/{id}', { id: '1' })).toBe('/api/1')
  expect(compilePathnameTemplate('/api/i{id}i', { id: '1' })).toBe('/api/i{id}i')
  expect(compilePathnameTemplate('/api/{id}i', { id: '1' })).toBe('/api/{id}i')
  expect(compilePathnameTemplate('/api/%7Bid%7D', { id: '1' })).toBe('/api/1')
  expect(compilePathnameTemplate('/api/:i_d', { i_d: 1 })).toBe('/api/1')
  expect(compilePathnameTemplate('/api/:i-d', { 'i-d': 1 })).toBe('/api/1')
  expect(compilePathnameTemplate('/api/:i~d', { 'i~d': 1 })).toBe('/api/1')
  expect(compilePathnameTemplate('/api/:id', { id: '{t}', t: 1 })).toBe('/api/%7Bt%7D')
  expect(compilePathnameTemplate('/api/(id)', { id: '1' })).toBe('/api/(id)')
  expect(compilePathnameTemplate('/api/:id', {})).toBe('/api/:id')
  expect(compilePathnameTemplate('/api/{id}', {})).toBe('/api/{id}')
  expect(compilePathnameTemplate('/api/%7Bid%7D', {})).toBe('/api/%7Bid%7D')
  expect(compilePathnameTemplate('/api/:foo(^\\d*)', {})).toBe('/api/:foo(^\\d*)')
  expect(compilePathnameTemplate('/api/:foo/{bar}', { foo: 'bar', bar: 'foo' })).toBe('/api/bar/foo')
})
