import { describe, expect, test } from '@jest/globals'
import { fork, unwrap } from './fork'

describe('fork', () => {
  describe('copy-on-write behavior', () => {
    test('should not clone the object initially', () => {
      const original = { a: 1, b: 2 }
      const forked = fork(original)

      // Before modification, unwrap should return the original object
      expect(unwrap(forked)).toBe(original)
    })

    test('should clone the object only when modified', () => {
      const original = { a: 1, b: 2 }
      const forked = fork(original)

      // Modify the forked object
      forked.a = 10

      // After modification, unwrap should return a different object
      expect(unwrap(forked)).not.toBe(original)
      expect(unwrap(forked)).toEqual({ a: 10, b: 2 })
      expect(original).toEqual({ a: 1, b: 2 })
    })
  })

  describe('primitive values', () => {
    test('should handle number as input', () => {
      const original = 42
      let forked = fork(original)

      expect(forked).toBe(42)

      forked = 100

      expect(forked).toBe(100)
      expect(unwrap(forked)).toBe(100)
      expect(original).toBe(42)
    })

    test('should handle string as input', () => {
      const original = 'hello'
      let forked = fork(original)

      expect(forked).toBe('hello')

      forked = 'world'

      expect(forked).toBe('world')
      expect(unwrap(forked)).toBe('world')
      expect(original).toBe('hello')
    })

    test('should handle boolean as input', () => {
      const original = true
      let forked = fork(original)

      expect(forked).toBe(true)

      forked = false

      expect(forked).toBe(false)
      expect(unwrap(forked)).toBe(false)
      expect(original).toBe(true)
    })

    test('should handle null as input', () => {
      const original = null
      const forked = fork(original)

      expect(forked).toBeNull()
      expect(unwrap(forked)).toBeNull()
    })

    test('should handle undefined as input', () => {
      const original = undefined
      const forked = fork(original)

      expect(forked).toBeUndefined()
      expect(unwrap(forked)).toBeUndefined()
    })
  })

  describe('property operations', () => {
    test('should get property values', () => {
      const original = { a: 1, b: 'test', c: true }
      const forked = fork(original)

      expect(forked.a).toBe(1)
      expect(forked.b).toBe('test')
      expect(forked.c).toBe(true)
    })

    test('should set property values', () => {
      const original = { a: 1, b: 2 }
      const forked = fork(original)

      forked.a = 100
      forked.b = 200

      expect(forked.a).toBe(100)
      expect(forked.b).toBe(200)
      expect(original.a).toBe(1)
      expect(original.b).toBe(2)
    })

    test('should add new properties', () => {
      const original: any = { a: 1 }
      const forked: any = fork(original)

      forked.b = 2
      forked.c = 3

      expect(forked.b).toBe(2)
      expect(forked.c).toBe(3)
      expect(original.b).toBeUndefined()
      expect(original.c).toBeUndefined()
    })

    test('should delete properties', () => {
      const original: any = { a: 1, b: 2, c: 3 }
      const forked: any = fork(original)

      delete forked.b

      expect(forked.b).toBeUndefined()
      expect(original.b).toBe(2)
      expect(unwrap(forked)).toEqual({ a: 1, c: 3 })
    })
  })

  describe('nested objects', () => {
    test('should handle nested object reads without cloning', () => {
      const original = { a: { b: { c: 1 } } }
      const forked = fork(original)

      expect(forked.a.b.c).toBe(1)
      expect(unwrap(forked)).toBe(original)
    })

    test('should clone when modifying nested properties', () => {
      const original = { a: { b: { c: 1 } } }
      const forked = fork(original)

      forked.a.b.c = 10

      expect(unwrap(forked)).not.toBe(original)
      expect(forked.a.b.c).toBe(10)
      expect(original.a.b.c).toBe(1)
    })

    test('should handle adding nested objects', () => {
      const original: any = { a: 1 }
      const forked: any = fork(original)

      forked.nested = { b: 2 }

      expect(forked.nested.b).toBe(2)
      expect(original.nested).toBeUndefined()
    })
  })

  describe('array operations', () => {
    test('should handle array property access', () => {
      const original = { arr: [1, 2, 3] }
      const forked = fork(original)

      expect(forked.arr[0]).toBe(1)
      expect(forked.arr[1]).toBe(2)
      expect(forked.arr[2]).toBe(3)
      expect(unwrap(forked)).toBe(original)
    })

    test('should handle array element modification', () => {
      const original = { arr: [1, 2, 3] }
      const forked = fork(original)

      forked.arr[0] = 10

      expect(forked.arr[0]).toBe(10)
      expect(original.arr[0]).toBe(1)
      expect(unwrap(forked)).not.toBe(original)
    })

    test('should handle array push method', () => {
      const original = { arr: [1, 2, 3] }
      const forked = fork(original)

      forked.arr.push(4)

      expect(forked.arr).toEqual([1, 2, 3, 4])
      expect(original.arr).toEqual([1, 2, 3])
    })

    test('should handle array pop method', () => {
      const original = { arr: [1, 2, 3] }
      const forked = fork(original)

      const popped = forked.arr.pop()

      expect(popped).toBe(3)
      expect(forked.arr).toEqual([1, 2])
      expect(original.arr).toEqual([1, 2, 3])
    })

    test('should handle array shift method', () => {
      const original = { arr: [1, 2, 3] }
      const forked = fork(original)

      const shifted = forked.arr.shift()

      expect(shifted).toBe(1)
      expect(forked.arr).toEqual([2, 3])
      expect(original.arr).toEqual([1, 2, 3])
    })

    test('should handle array unshift method', () => {
      const original = { arr: [1, 2, 3] }
      const forked = fork(original)

      forked.arr.unshift(0)

      expect(forked.arr).toEqual([0, 1, 2, 3])
      expect(original.arr).toEqual([1, 2, 3])
    })

    test('should handle array splice method', () => {
      const original = { arr: [1, 2, 3, 4] }
      const forked = fork(original)

      forked.arr.splice(1, 2, 10, 20)

      expect(forked.arr).toEqual([1, 10, 20, 4])
      expect(original.arr).toEqual([1, 2, 3, 4])
    })

    test('should handle array sort method', () => {
      const original = { arr: [3, 1, 2] }
      const forked = fork(original)

      forked.arr.sort()

      expect(forked.arr).toEqual([1, 2, 3])
      expect(original.arr).toEqual([3, 1, 2])
    })

    test('should handle array reverse method', () => {
      const original = { arr: [1, 2, 3] }
      const forked = fork(original)

      forked.arr.reverse()

      expect(forked.arr).toEqual([3, 2, 1])
      expect(original.arr).toEqual([1, 2, 3])
    })

    test('should handle array fill method', () => {
      const original = { arr: [1, 2, 3] }
      const forked = fork(original)

      forked.arr.fill(0)

      expect(forked.arr).toEqual([0, 0, 0])
      expect(original.arr).toEqual([1, 2, 3])
    })

    test('should handle array copyWithin method', () => {
      const original = { arr: [1, 2, 3, 4, 5] }
      const forked = fork(original)

      forked.arr.copyWithin(0, 3)

      expect(forked.arr).toEqual([4, 5, 3, 4, 5])
      expect(original.arr).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('complex scenarios', () => {
    test('should handle JSON.stringify correctly', () => {
      const original = { a: 1, b: { c: 2 }, d: [1, 2, 3] }
      const forked = fork(original)

      // Before modification, JSON.stringify should work correctly
      expect(JSON.stringify(forked)).toBe(JSON.stringify(original))
      expect(JSON.stringify(forked)).toBe('{"a":1,"b":{"c":2},"d":[1,2,3]}')

      // After modification, JSON.stringify should reflect the changes
      forked.a = 10
      expect(JSON.stringify(forked)).toBe('{"a":10,"b":{"c":2},"d":[1,2,3]}')

      // Verify original is not modified
      expect(JSON.stringify(original)).toBe('{"a":1,"b":{"c":2},"d":[1,2,3]}')
    })

    test('should handle Object.keys correctly', () => {
      const original = { a: 1, b: 2, c: 3 }
      const forked: any = fork(original)

      expect(Object.keys(forked)).toEqual(['a', 'b', 'c'])

      forked.d = 4
      expect(Object.keys(forked)).toEqual(['a', 'b', 'c', 'd'])
      expect(Object.keys(original)).toEqual(['a', 'b', 'c'])
    })

    test('should handle Object.entries correctly', () => {
      const original = { a: 1, b: 2 }
      const forked = fork(original)

      expect(Object.entries(forked)).toEqual([['a', 1], ['b', 2]])

      forked.a = 10
      expect(Object.entries(forked)).toEqual([['a', 10], ['b', 2]])
      expect(Object.entries(original)).toEqual([['a', 1], ['b', 2]])
    })

    test('should handle spread operator correctly', () => {
      const original = { a: 1, b: 2 }
      const forked = fork(original)

      const spread = { ...forked }
      expect(spread).toEqual({ a: 1, b: 2 })

      forked.a = 10
      const spread2 = { ...forked }
      expect(spread2).toEqual({ a: 10, b: 2 })
      expect(original).toEqual({ a: 1, b: 2 })
    })

    test('should handle multiple modifications', () => {
      const original = { a: 1, b: { c: 2 }, d: [1, 2, 3] }
      const forked = fork(original)

      forked.a = 10
      forked.b.c = 20
      forked.d.push(4)

      expect(unwrap(forked)).toEqual({ a: 10, b: { c: 20 }, d: [1, 2, 3, 4] })
      expect(original).toEqual({ a: 1, b: { c: 2 }, d: [1, 2, 3] })
    })

    test('should handle object with null values', () => {
      const original: any = { a: null, b: 2 }
      const forked: any = fork(original)

      expect(forked.a).toBeNull()
      forked.a = 10

      expect(forked.a).toBe(10)
      expect(original.a).toBeNull()
    })

    test('should handle empty objects', () => {
      const original = {}
      const forked: any = fork(original)

      forked.a = 1

      expect(forked.a).toBe(1)
      expect(original).toEqual({})
    })
  })
})

describe('unwrap', () => {
  test('should return the original object from forked object', () => {
    const original = { a: 1, b: 2 }
    const forked = fork(original)

    expect(unwrap(forked)).toBe(original)
  })

  test('should return cloned object after modification', () => {
    const original = { a: 1, b: 2 }
    const forked = fork(original)

    forked.a = 10

    const unwrapped = unwrap(forked)
    expect(unwrapped).not.toBe(original)
    expect(unwrapped).toEqual({ a: 10, b: 2 })
  })

  test('should return the same value for non-proxy objects', () => {
    const obj = { a: 1 }
    expect(unwrap(obj)).toBe(obj)
  })

  test('should handle null and undefined', () => {
    expect(unwrap(null as any)).toBeNull()
    expect(unwrap(undefined as any)).toBeUndefined()
  })
})

