import { fork } from './fork'

const JsonCachePropertyKey = Symbol('KeqResponseProxyJsonCachePropertyKey')
const TextCachePropertyKey = Symbol('KeqResponseProxyTextCachePropertyKey')

export function createProxyResponse(response: Response): Response {
  return new Proxy(response, {
    get(res, prop) {
      if (typeof prop === 'string') {
        if (prop === 'json') {
          return new Proxy(res[prop], {
            apply() {
              if (res[JsonCachePropertyKey]) {
                return fork(res[JsonCachePropertyKey]) as unknown
              }

              return res.clone().json()
                .then((body) => {
                  res[JsonCachePropertyKey] = body
                  return fork(body) as unknown
                })
            },
          })
        } else if (prop === 'text') {
          return new Proxy(res[prop], {
            apply() {
              if (res[TextCachePropertyKey]) {
                return fork(res[TextCachePropertyKey]) as unknown
              }

              return res.clone().text()
                .then((body) => {
                  res[TextCachePropertyKey] = body
                  return body
                })
            },
          })
        } else if (['arrayBuffer', 'blob', 'buffer', 'formData'].includes(prop)) {
          /**
           * clone when invoking body, json, text, arrayBuffer, blob, buffer, formData
           * to avoid time-consuming cloning
           */
          return new Proxy(res[prop], {
            apply(target, thisArg, argArray) {
              return res.clone()[prop](...argArray) as unknown
            },
          }) as unknown
        } else if (prop === 'body') {
          const mirror = res.clone()
          return mirror.body
        }
      }

      if (typeof res[prop] === 'function') {
        return res[prop].bind(res) as unknown
      }

      return res[prop] as unknown
    },
  })
}
