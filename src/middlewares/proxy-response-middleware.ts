import type { KeqMiddleware } from '../types/keq-middleware.js'


export function proxyResponseMiddleware(): KeqMiddleware {
  return async function proxyResponseMiddleware(ctx, next) {
    await next()

    const res = ctx.res

    if (res && !('response' in ctx)) {
      ctx.response = new Proxy(res, {
        get(res, prop) {
          if (typeof prop === 'string') {
            if (['json', 'text', 'arrayBuffer', 'blob', 'buffer', 'formData'].includes(prop)) {
              /**
               * clone when invoking body, json, text, arrayBuffer, blob, buffer, formData
               * to avoid time-consuming cloning
               */
              return new Proxy(res[prop], {
                apply(target, thisArg, argArray) {
                  const mirror = res.clone()
                  return mirror[prop](...argArray)
                },
              })
            }

            if (prop === 'body') {
              const mirror = res.clone()
              return mirror.body
            }
          }

          if (typeof res[prop] === 'function') {
            return res[prop].bind(res)
          }

          return res[prop]
        },
      })
    }
  }
}
