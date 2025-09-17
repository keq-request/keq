export type KeqContextRequestMethod = 'get' | 'post' | 'put' | 'delete' | 'head' | 'patch' | 'options'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KeqContextRequestBody = BodyInit | object | Array<any> | undefined
//  object | Array<any> | string | undefined

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
