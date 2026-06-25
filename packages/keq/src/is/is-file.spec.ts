import { expect, test } from '@jest/globals'
import { isFile } from './is-file.js'

test('isFile', () => {
  const file = new File(['a'], 'a.txt')

  expect(isFile(file)).toBeTruthy()
  expect(isFile({})).toBeFalsy()
})
