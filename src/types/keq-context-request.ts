export type KeqContextRequestMethod = 'get' | 'post' | 'put' | 'delete' | 'head' | 'patch' | 'options'
export type KeqContextRequestBody = object | Array<any> | string | undefined

export interface KeqContextRequest {
  url: URL
  routeParams: Record<string, string>

  // the url merged routeParams
  readonly __url__: Readonly<URL>

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
