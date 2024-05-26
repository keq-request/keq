import { expect, test } from '@jest/globals'
import { isBlob } from './is-blob.js'

test('isBlob', () => {
  const blob = new Blob(['a'])

  expect(isBlob(blob)).toBeTruthy()
  expect(isBlob({})).toBeFalsy()
})
