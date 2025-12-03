import { KeqRequestInit } from '../request-init'


export function cloneRequestInit(init: KeqRequestInit): KeqRequestInit {
  return new KeqRequestInit({
    url: init.url,
    pathParameters: init.pathParameters,
    method: init.method,
    headers: init.headers,
    body: init.body,
    cache: init.cache,
    credentials: init.credentials,
    integrity: init.integrity,
    keepalive: init.keepalive,
    mode: init.mode,
    redirect: init.redirect,
    referrer: init.referrer,
    referrerPolicy: init.referrerPolicy,
  })
}
