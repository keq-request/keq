import { expect, test } from '@jest/globals'
import { OverwriteArrayBodyException } from '~/exception/overwrite-array-body.exception'
import { assignKeqRequestBody } from './assign-keq-request-body'

test('assign array to undefined', () => {
  const body = assignKeqRequestBody(undefined, [1, 2, 3])
  expect(body).toEqual([1, 2, 3])
})

test('assign array to string throw error', () => {
  expect(() => assignKeqRequestBody('abc', [1, 2, 3])).toThrow()
})

test('assign array to object throw error', () => {
  expect(() => assignKeqRequestBody({ a: 1 }, [1, 2, 3])).toThrow()
})

test('assign array to form data throw error', () => {
  expect(() => assignKeqRequestBody(new FormData(), [1, 2, 3])).toThrow()
})

test('assign array to url search params throw error', () => {
  expect(() => assignKeqRequestBody(new URLSearchParams(), [1, 2, 3])).toThrow()
})

test('assign data to array throw error', () => {
  expect(() => assignKeqRequestBody([1, 2, 3], { a: 1 })).toThrow(OverwriteArrayBodyException)
})

test('assign data to string throw error', () => {
  expect(() => assignKeqRequestBody('abc', { a: 1 })).toThrow()
})

test('assign string to object throw error', () => {
  expect(() => assignKeqRequestBody({ a: 1 }, 'abc')).toThrow()
})

test('assign string to undefined', () => {
  const body = assignKeqRequestBody(undefined, 'abc')
  expect(body).toBe('abc')
})

test('assign number to undefined throw error', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(() => assignKeqRequestBody(undefined, 123 as any)).toThrow()
})


test('assign object to object', () => {
  const body = assignKeqRequestBody({ a: 1 }, { b: 2 })
  expect(body).toEqual({ a: 1, b: 2 })
})

test('assign form data to object', () => {
  const formData = new FormData()
  formData.append('a', 'a1')
  formData.append('b', 'b1')
  formData.append('b', 'b2')

  const body = assignKeqRequestBody({ a: 'a0', b: 'b0', c: 'c0' }, formData)
  expect(body).toEqual({ a: 'a1', b: ['b1', 'b2'], c: 'c0' })
})

test('assign url search params to object', () => {
  const urlSearchParams = new URLSearchParams()
  urlSearchParams.append('a', 'a1')
  urlSearchParams.append('b', 'b1')
  urlSearchParams.append('b', 'b2')

  const body = assignKeqRequestBody({ a: 'a0', b: 'b0', c: 'c0' }, urlSearchParams)
  expect(body).toEqual({ a: 'a1', b: ['b1', 'b2'], c: 'c0' })
})
