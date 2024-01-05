import { URL } from 'whatwg-url'
import { Keq } from '~/keq'
import { KeqRouter } from '~/router/keq-router.js'
import { KeqMiddleware } from './keq-middleware'
import { KeqRequestInit } from './keq-request-init'

type KeqRequestFn = <T = any>(url: string | URL | globalThis.URL) => Keq<T>

type GlobalURL = globalThis.URL

export interface KeqRequest {
  <T = any>(url: string | URL | GlobalURL, init: KeqRequestInit): Keq<T>

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
