import { Exception } from '../exception/exception.js'

import type { KeqMiddleware } from '../types/keq-middleware.js'


export function composeMiddleware(middlewares: KeqMiddleware[]): KeqMiddleware {
  if (!middlewares.length) {
    throw new Exception('At least one middleware')
  }

  const middleware = [...middlewares]
    .reverse()
    .reduce(function (prev, curr): KeqMiddleware {
      return async (ctx, next) => {
        const metadata = {
          finished: false,
          entryNextTimes: 0,
          outNextTimes: 0,
        }

        const context = new Proxy(ctx, {
          get(target, property) {
            if (property === 'metadata') return metadata

            // @ts-ignore
            return target[property]
          },
        })

        await curr(context, async () => {
          if (metadata.finished) {
            throw new Exception([
              `next() should not invoke after ${curr.toString()} middleware finished.`,
            ].join(''))
          }

          if (metadata.entryNextTimes > 1) {
            console.warn(`next() had be invoke multiple times at ${curr.toString()} middleware`)
          }
          metadata.entryNextTimes += 1

          await prev(ctx, next)

          metadata.outNextTimes += 1
        })


        metadata.finished = true
        if (metadata.entryNextTimes === 0) {
          console.warn(`next() is not invoked at ${curr.toString()}.`)
        }

        if (metadata.entryNextTimes !== metadata.outNextTimes) {
          throw new Exception([
            `next() should be invoke before ${curr.toString()} middleware finish.`,
            'Maybe you forgot to await when calling next().',
          ].join(''))
        }
      }
    })

  return middleware
}
