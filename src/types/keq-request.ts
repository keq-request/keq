import type { URL } from 'whatwg-url'
import type { KeqRouter } from '~/router/keq-router.js'
import type { Keq } from '~/keq.js'
import type { KeqMiddleware } from './keq-middleware.js'
import type { KeqRequestInit } from './keq-request-init.js'

type KeqRequestFn = <T = any>(url: string | URL | globalThis.URL) => Keq<T>

type GlobalURL = globalThis.URL

export interface KeqRequest {
  <T = any>(url: string | URL | GlobalURL, init: Omit<KeqRequestInit, 'global'>): Keq<T>

  baseOrigin: (baseOrigin: string) => void

  get: KeqRequestFn
  post: KeqRequestFn
  del: KeqRequestFn
  delete: KeqRequestFn
  put: KeqRequestFn
  patch: KeqRequestFn
  head: KeqRequestFn

  use(firstMiddleware: KeqMiddleware, ...middleware: KeqMiddleware[]): this
  useRouter(): KeqRouter
}
