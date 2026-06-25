import { expect, test } from '@jest/globals'
import { cloneBody } from './clone-body'

test('clone number', () => {
  expect(cloneBody(1)).toBe(1)
})

test('clone string', () => {
  expect(cloneBody('a')).toBe('a')
})

test('clone null', () => {
  expect(cloneBody(null)).toBe(null)
})

test('clone undefined', () => {
  expect(cloneBody(undefined)).toBe(undefined)
})

test('clone array', () => {
  const array = [1, 2, 3]
  const cloned = cloneBody(array)
  expect(cloned).toEqual(array)
  expect(cloned).not.toBe(array)
})

test('clone object', () => {
  const object = {
    a: 1,
    b: {
      c: [1, 2, 3],
    },
    e: new Blob(['hello world']),
  }

  const cloned = cloneBody(object)

  expect(cloned).toEqual(object)
  expect(cloned).not.toBe(object)
  expect(cloned.b).not.toBe(object.b)
  expect(cloned.b.c).not.toBe(object.b.c)
  expect(cloned.b.c).toEqual(object.b.c)
  expect(cloned.e).toBe(object.e)
})
