import { expect, test } from '@jest/globals'
import { composeMiddleware } from './compose-middleware.js'

test('compose empty route', () => {
  expect(() => composeMiddleware([])).toThrowError()
})
