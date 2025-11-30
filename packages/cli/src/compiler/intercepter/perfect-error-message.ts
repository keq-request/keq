/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as R from 'ramda'
import { FullTap, HookInterceptor, InnerCallback } from 'tapable'

export function perfectErrorMessage(): HookInterceptor<unknown, unknown> {
  return {
    register: <T extends FullTap>(tap: T): T => {
      const fn = tap.fn

      function prefix(err: unknown): void {
        if (err instanceof Error) {
          err.message = `[Plugin: ${tap.name}] ${err.message}`
        }
      }

      if (tap.type === 'promise') {
        tap.fn = async (...args: any[]) => {
          try {
            return await fn(...args)
          } catch (err) {
            prefix(err)
            throw err
          }
        }
      }

      if (tap.type === 'sync') {
        tap.fn = (...args: any[]) => {
          try {
            return fn(...args)
          } catch (err) {
            prefix(err)
            throw err
          }
        }
      }

      if (tap.type === 'async') {
        tap.fn = (...args: any[]) => {
          const callback = R.last(args) as InnerCallback<Error, any>

          return fn(...R.init(args), (err: Error | null, result: any) => {
            prefix(err)
            return callback(err, result)
          })
        }
      }

      return tap
    },
  }
}
