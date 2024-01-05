import { expect, jest, test } from '@jest/globals'
import { composeRoute } from './compose-route.js'

test('compose two route', async () => {
  const route1 = jest.fn(() => true)
  const route2 = jest.fn(() => true)

  const route = composeRoute([route1, route2])
  await route({} as any)

  expect(route1).toBeCalled()
  expect(route2).toBeCalled()
})

test('compose empty route', () => {
  expect(() => composeRoute([])).toThrowError()
})
