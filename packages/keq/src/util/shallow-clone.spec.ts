import { expect, test } from '@jest/globals'
import { shallowClone } from './shallow-clone'

test('clone number', () => {
  expect(shallowClone(1)).toBe(1)
})

test('clone string', () => {
  expect(shallowClone('a')).toBe('a')
})

test('clone boolean', () => {
  expect(shallowClone(true)).toBe(true)
})

test('clone null', () => {
  expect(shallowClone(null)).toBe(null)
})

test('clone undefined', () => {
  expect(shallowClone(undefined)).toBe(undefined)
})

test('clone array', () => {
  const a = [1, 2, 3]
  const b = shallowClone(a)
  expect(b).toEqual(a)
  expect(b).not.toBe(a)
})

test('clone object', () => {
  const a = {
    a: 1,
    b: 'a',
    c: true,
    d: null,
    e: undefined,
    f: [1, 2, 3],
    g: { a: 1 },
  }
  const b = shallowClone(a)
  expect(b).toEqual(a)
  expect(b).not.toBe(a)
  expect(b.a).toBe(a.a)
  expect(b.b).toBe(a.b)
  expect(b.c).toBe(a.c)
  expect(b.d).toBe(a.d)
  expect(b.e).toBe(a.e)
  expect(b.f).toBe(a.f)
  expect(b.g).toBe(a.g)
})
