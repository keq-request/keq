import type { Keq } from '~/request/keq.js'
import type { KeqTimeoutOptions, KeqFlowControlOptions } from '~/middlewares/index.js'
import type { KeqResolveWithMode } from './keq-resolve-with-mode.js'
import type { KeqRetryOptions } from './keq-retry-options.js'
import { KeqModuleOptions } from './keq-module-options.js'
import { ConditionalExcept } from 'type-fest'


export interface KeqOptions<T> {
  /**
   * replace the default fetch api
   * default use node-fetch@2 in node and window.fetch in browser
   */
  fetchAPI(value: typeof fetch): Keq<T>

  /**
   * how to resolve the response body
   * @description 如何解析响应体
   * @default 'intelligent'
   */
  resolveWith(value: KeqResolveWithMode): Keq<T>

  retry(value: KeqRetryOptions): Keq<T>

  module(value: KeqModuleOptions): Keq<T>

  flowControl(value: KeqFlowControlOptions): Keq<T>

  timeout(value: KeqTimeoutOptions): Keq<T>
}


type ExpectNever<T> = ConditionalExcept<T, never>

export type KeqOptionsParameter = ExpectNever<{
  [key in keyof KeqOptions<any>]?: Parameters<KeqOptions<any>[key]>[0]
}>

export type KeqOptionsReturnType<T> = ExpectNever<{
  [key in keyof KeqOptions<T>]: ReturnType<KeqOptions<T>[key]>
}>
