
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { klona } from 'klona/json'


const UnWrapPropertyKey = Symbol('UnWrapPropertyKey')

const ARRAY_MUTATORS = new Set([
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
  'fill',
  'copyWithin',
])

function objectPath(obj: any, path: PropertyKey[]): any {
  return path.reduce((o, k) => o[k], obj)
}

/**
 * Fork an json object, using copy-on-write strategy to avoid unnecessary deep cloning.
 */
export function fork<T>(original: T): T {
  if (original === null || typeof original !== 'object') {
    // primitive value, return directly
    return original
  }

  let current = original

  const ensureCopy = (): T => {
    if (current === original) {
      current = klona(original)
    }

    return current
  }


  const createProxy = (path: PropertyKey[] = []): any => {
    return new Proxy({} as any, {
      get(_, prop) {
        const target = objectPath(current, path)
        if (prop === UnWrapPropertyKey) return target

        const value = target[prop]

        // return value directly if already copied
        if (current !== original) {
          return value
        }

        // handle array mutator methods
        if (Array.isArray(target) && ARRAY_MUTATORS.has(prop as string)) {
          return new Proxy(value, {
            apply(fn, thisArg, args) {
              ensureCopy()
              const t = objectPath(current, path)
              return Reflect.apply(t[prop], t, args)
            },
          })
        }

        // 未复制，嵌套对象需要继续代理
        if (typeof value === 'object' && value !== null) {
          return createProxy([...path, prop])
        }

        return value
      },

      set(_, prop, value) {
        ensureCopy()
        objectPath(current, path)[prop] = value
        return true
      },

      deleteProperty(_, prop) {
        ensureCopy()
        delete objectPath(current, path)[prop]
        return true
      },
    })
  }

  return createProxy()
}

export function unwrap<T>(proxy: T): T {
  return proxy && (proxy as any)[UnWrapPropertyKey] ? (proxy as any)[UnWrapPropertyKey] : proxy
}
