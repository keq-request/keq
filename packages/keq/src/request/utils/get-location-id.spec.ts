import { expect, test } from '@jest/globals'
import { getLocationId } from './get-location-id'

test('returns caller location in normal stack', () => {
  const locationId = getLocationId(0)
  expect(locationId).toEqual(expect.any(String))
  expect(locationId.length).toBeGreaterThan(0)
})

test('returns location with depth 1 (production call path)', () => {
  expect(getLocationId(1)).toEqual(expect.any(String))
})

test('does not throw when depth exceeds stack frames (shallow stack)', () => {
  expect(() => getLocationId(100)).not.toThrow()
  const locationId = getLocationId(100)
  expect(locationId).toEqual(expect.any(String))
  expect(locationId.length).toBeGreaterThan(0)
})
