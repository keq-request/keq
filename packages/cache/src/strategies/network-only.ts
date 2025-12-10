import { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'


export const networkOnly: KeqCacheStrategy = async function (handler, context, next) {
  await next()
}
