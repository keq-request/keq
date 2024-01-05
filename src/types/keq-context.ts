import { URL } from 'whatwg-url'
import { OUTPUT_PROPERTY } from '~/constant'
import { KeqOptions } from './keq-options'
import { KeqRequestBody } from './keq-request-body'
import { KeqRequestMethod } from './keq-request-method'


export interface KeqRequestContext {
  url: URL | globalThis.URL
  method: KeqRequestMethod
  headers: Headers
  routeParams: Record<string, string>
  body: KeqRequestBody
  cache?: RequestCache
  credentials?: RequestCredentials
  integrity?: string
  keepalive?: boolean
  mode?: RequestMode
  redirect?: RequestRedirect
  referrer?: string
  referrerPolicy?: ReferrerPolicy
  signal?: AbortSignal | null
}

export interface KeqContext {
  options: KeqOptions

  /**
   * Fetch API Arguments
   */
  fetchArguments?: [RequestInfo | string, RequestInit]

  /**
   * keq request context
   */
  request: KeqRequestContext

  /** original response */
  res?: Response

  /** proxy response */
  response?: Response

  /** the result get by user */
  output: any
  [OUTPUT_PROPERTY]?: any

  /** share data between requests */
  global: Record<string, any>

  /** extends by middleware */
  [key: string]: any
}
