export function createResponseProxy(res: Response): Response {
  return new Proxy(res, {
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
