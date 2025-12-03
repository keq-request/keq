import { AbortControllerProperty, KeqRequestInit } from '../request-init'

export function assignRequestInit(
  target: KeqRequestInit,
  source: KeqRequestInit,
): void {
  target.url = source.url
  target.pathParameters = source.pathParameters
  target.method = source.method
  target.headers = source.headers
  target.body = source.body
  target.cache = source.cache
  target.credentials = source.credentials
  target.integrity = source.integrity
  target.keepalive = source.keepalive
  target.mode = source.mode
  target.redirect = source.redirect
  target.referrer = source.referrer
  target.referrerPolicy = source.referrerPolicy
  target[AbortControllerProperty] = source[AbortControllerProperty]
}
