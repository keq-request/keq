/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from '@jest/globals'
import { mergeKeqRequestBody } from './merge-keq-request-body'

test('mergeKeqResponseBody(any, array)', () => {
  expect(mergeKeqRequestBody(undefined, [1, 2, 3])).toEqual([1, 2, 3])
  expect(mergeKeqRequestBody('abc', [1, 2, 3])).toEqual([1, 2, 3])
  expect(mergeKeqRequestBody({ a: 1 }, [1, 2, 3])).toEqual([1, 2, 3])
  expect(mergeKeqRequestBody(new FormData(), [1, 2, 3])).toEqual([1, 2, 3])
  expect(mergeKeqRequestBody(new URLSearchParams(), [1, 2, 3])).toEqual([1, 2, 3])
})

test('mergeKeqResponseBody(any, object)', () => {
  expect(mergeKeqRequestBody([1, 2, 3], { a: 1 })).toEqual({ a: 1 })
  expect(mergeKeqRequestBody('abc', { a: 1 })).toEqual({ a: 1 })
  expect(mergeKeqRequestBody({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })

  const formData = new FormData()
  formData.append('a', 'a1')
  formData.append('b', 'b1')
  formData.append('b', 'b2')
  expect(mergeKeqRequestBody({ a: 'a0', b: 'b0', c: 'c0' }, formData)).toEqual({ a: 'a1', b: ['b1', 'b2'], c: 'c0' })

  const urlSearchParams = new URLSearchParams()
  urlSearchParams.append('a', 'a1')
  urlSearchParams.append('b', 'b1')
  urlSearchParams.append('b', 'b2')
  expect(mergeKeqRequestBody({ a: 'a0', b: 'b0', c: 'c0' }, urlSearchParams)).toEqual({ a: 'a1', b: ['b1', 'b2'], c: 'c0' })
})

test('mergeKeqRequestBody(any, string)', () => {
  expect(mergeKeqRequestBody({ a: 1 }, 'abc')).toBe('abc')
  expect(mergeKeqRequestBody(undefined, 'abc')).toBe('abc')
})

test('mergeKeqRequestBody(unExpect, unExpect)', () => {
  expect(() => mergeKeqRequestBody(undefined, 123 as any)).toThrow()
})
