/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { ConditionalPick } from 'type-fest'


type Watcher = (target: any, thisArg: any, argArray: any[]) => void

export function watchObject<T extends object>(obj: T, listeners: Partial<Record<keyof ConditionalPick<T, Function>, Watcher>>): T {
  return new Proxy(obj, {
    get(target, prop) {
      if (prop in listeners) {
        return new Proxy(target[prop], {
          apply(target: Function, thisArg, argArray) {
            const listener: Function = listeners[prop]
            listener(target, thisArg, argArray)
            return target.apply(thisArg, argArray)
          },
        })
      }

      return target[prop]
    },
  })
}
