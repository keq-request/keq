import { Emitter } from 'mitt'
import { URL } from 'whatwg-url'
import { ABORT_PROPERTY, NEXT_INVOKED_PROPERTY, OUTPUT_PROPERTY } from '~/constant.js'
import type { KeqRequestBody } from './keq-request-body.js'
import type { KeqRequestMethod } from './keq-request-method.js'
import type { KeqOptionsParameter } from './keq-options.js'
import type { KeqEvents } from './keq-events.js'
import type { KeqGlobal } from './keq-global.js'


export interface KeqContextOptions extends KeqOptionsParameter {
  [key: string]: any
}

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
}

export interface KeqContext {
  /**
   * Middleware invoker counter
   *
   * to prevent someone from calling next
   * multiple times or forgetting to write await
   */
  [NEXT_INVOKED_PROPERTY]: {
    finished: boolean
    entryNextTimes: number
    outNextTimes: number
  }

  [ABORT_PROPERTY]?: AbortController
  abort: (reason: any) => void

  emitter: Emitter<Omit<KeqEvents, never>>

  options: KeqContextOptions

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
  global: KeqGlobal

  /** retry information, undefined is no retry */
  retry?: {
    attempt: number
    error: unknown | null
    delay: number
  }

  /** extends by middleware */
  [key: string]: any
}
