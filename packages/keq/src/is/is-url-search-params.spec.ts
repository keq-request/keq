import { expect, test } from '@jest/globals'
import { isUrlSearchParams } from './is-url-search-params.js'


test('isUrlSearchParams', () => {
  const urlSearchParams = new URLSearchParams()
  expect(isUrlSearchParams(urlSearchParams)).toBeTruthy()
  expect(isUrlSearchParams({})).toBeFalsy()
})
