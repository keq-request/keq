import { URL } from 'whatwg-url'
export type KeqContextRequestMethod = 'get' | 'post' | 'put' | 'delete' | 'head' | 'patch'
export type KeqContextRequestBody = object | Array<any> | string | undefined

export interface KeqContextRequest {
  url: URL | globalThis.URL
  routeParams: Record<string, string>

  // the url merged routeParams
  readonly __url__: Readonly<URL> | Readonly<globalThis.URL>

  method: KeqContextRequestMethod
  headers: Headers
  body: KeqContextRequestBody
  cache?: RequestCache
  credentials?: RequestCredentials
  integrity?: string
  keepalive?: boolean
  mode?: RequestMode
  redirect?: RequestRedirect
  referrer?: string
  referrerPolicy?: ReferrerPolicy
}
