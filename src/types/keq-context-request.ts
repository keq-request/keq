import { URL } from 'whatwg-url'
export type KeqContextRequestMethod = 'get' | 'post' | 'put' | 'delete' | 'head' | 'patch'
export type KeqContextRequestBody = object | Array<any> | string | undefined

export interface KeqContextRequest {
  url: URL | globalThis.URL
  method: KeqContextRequestMethod
  headers: Headers
  routeParams: Record<string, string>
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
