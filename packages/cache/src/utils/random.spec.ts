import { expect, test } from '@jest/globals'
import { random } from './random'

test('random(1, 10)', () => {
  const num = random(1, 10)
  expect(num).toBeGreaterThanOrEqual(1)
  expect(num).toBeLessThan(10)
})
