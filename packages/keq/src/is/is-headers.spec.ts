import { expect, test } from '@jest/globals'
import { isHeaders } from './is-headers'

test('isHeaders', async () => {
  expect(isHeaders(new Headers())).toBeTruthy()
  expect(isHeaders({})).toBeFalsy()
})
