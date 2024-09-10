/* eslint-disable @typescript-eslint/no-explicit-any */
import { ABORT_PROPERTY, NEXT_INVOKED_PROPERTY, OUTPUT_PROPERTY } from '../constant.js'

import type { Emitter } from 'mitt'
import type { KeqOptionsParameter } from './keq-options.js'
import type { KeqEvents } from './keq-events.js'
import type { KeqGlobal } from './keq-global.js'
import type { KeqContextRequest } from './keq-context-request.js'


export interface KeqContextOptions extends KeqOptionsParameter {
  [key: string]: any
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
  request: KeqContextRequest

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
