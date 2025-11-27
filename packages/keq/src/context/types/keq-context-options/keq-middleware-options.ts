import { ConditionalExcept } from 'type-fest'
import type { Keq } from '~/request/keq.js'
import type { KeqTimeoutOptions, KeqFlowControlOptions } from '~/middlewares/index.js'
import type { KeqResolveWithMode } from './keq-resolve-with-mode.js'
import type { KeqRetryOptions } from './keq-retry-options.js'
import { KeqModuleOptions } from './keq-module-options.js'
import { KeqOperation } from '~/request/index.js'


export interface KeqMiddlewareOptions<OP extends KeqOperation> {
  /**
   * replace the default fetch api
   * default use node-fetch@2 in node and window.fetch in browser
   */
  fetchAPI(value: typeof fetch): Keq<OP>

  /**
   * how to resolve the response body
   * @description 如何解析响应体
   * @default 'intelligent'
   */
  resolveWith(value: KeqResolveWithMode): Keq<OP>

  retry(value: KeqRetryOptions): Keq<OP>

  module(value: KeqModuleOptions): Keq<OP>

  flowControl(value: KeqFlowControlOptions): Keq<OP>

  timeout(value: KeqTimeoutOptions): Keq<OP>
}


type ExpectNever<T> = ConditionalExcept<T, never>

export type KeqMiddlewareOptionsParameter = ExpectNever<{
  [key in keyof KeqMiddlewareOptions<any>]?: Parameters<KeqMiddlewareOptions<any>[key]>[0]
}>

export type KeqMiddlewareOptionsReturnType<OP extends KeqOperation> = ExpectNever<{
  [key in keyof KeqMiddlewareOptions<OP>]: ReturnType<KeqMiddlewareOptions<OP>[key]>
}>
