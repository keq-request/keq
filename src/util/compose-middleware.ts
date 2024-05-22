import { Exception } from '~/exception/exception.js'

import type { KeqMiddleware } from '../types/keq-middleware.js'
import { NEXT_INVOKED_PROPERTY } from '~/constant.js'


export function composeMiddleware(middlewares: KeqMiddleware[]): KeqMiddleware {
  if (!middlewares.length) {
    throw new Exception('At least one middleware')
  }

  const middleware = [...middlewares]
    .reverse()
    .reduce(function (prev, curr): KeqMiddleware {
      return async (ctx, next) => {
        const invoked = {
          finished: false,
          entryNextTimes: 0,
          outNextTimes: 0,
        }

        const context = new Proxy(ctx, {
          get(target, property) {
            if (property === NEXT_INVOKED_PROPERTY) {
              return invoked
            }

            // @ts-ignore
            return target[property]
          },
        })

        await curr(context, async () => {
          if (invoked.finished) {
            throw new Exception([
              `next() should not invoke after ${curr.toString()} middleware finished.`,
            ].join(''))
          }

          if (invoked.entryNextTimes > 1) {
            console.warn(`next() had be invoke multiple times at ${curr.toString()} middleware`)
          }
          invoked.entryNextTimes += 1

          await prev(ctx, next)

          invoked.outNextTimes += 1
        })


        invoked.finished = true
        if (invoked.entryNextTimes === 0) {
          console.warn(`next() is not invoked at ${curr.toString()}.`)
        }

        if (invoked.entryNextTimes !== invoked.outNextTimes) {
          throw new Exception([
            `next() should be invoke before ${curr.toString()} middleware finish.`,
            'Maybe you forgot to await when calling next().',
          ].join(''))
        }
      }
    })

  return middleware
}
