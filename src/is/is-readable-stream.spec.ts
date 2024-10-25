import { expect, test } from '@jest/globals'
import { isReadableStream } from './is-readable-stream'

test('isReadableStream', async () => {
  expect(isReadableStream(new ReadableStream())).toBeTruthy()
  expect(isReadableStream({})).toBeFalsy()
})
