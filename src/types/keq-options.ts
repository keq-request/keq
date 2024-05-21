import { Keq } from '~/keq.js'
import { KeqFlowControl } from './keq-flow-control.js'
import { KeqResolveMethod } from './keq-resolve-with-mode.js'
import { KeqRetryDelay } from './keq-retry-delay'
import { KeqRetryOn } from './keq-retry-on'
import { KeqTimeout } from './keq-timeout.js'


export interface KeqOptions<T> {
  /**
   * replace the default fetch api
   * default use node-fetch@2 in node and window.fetch in browser
   */
  fetchAPI(value: typeof fetch): Keq<T>

  /**
   * get response object, defaulted `false`
   * @deprecated use `resolveWith` instead
   * */
  resolveWithFullResponse(value: boolean): Keq<Response>

  /**
   * how to resolve the response body
   * @description 如何解析响应体
   * @default 'intelligent'
   */
  resolveWith(value: KeqResolveMethod): Keq<T>

  /**
   * The request retry times
   * @description 重试次数
   */
  retryTimes(value: number): Keq<T>

  /**
   * The request retry interval time
   * @description 重试间隔时间
   */
  retryDelay(value: KeqRetryDelay): Keq<T>

  /**
   * Custom retry condition
   * @description 自定义重试条件
   */
  retryOn(value: KeqRetryOn): Keq<T>

  module(value: { name: string; pathname: string }): Keq<T>

  flowControl(value: KeqFlowControl): Keq<T>

  timeout(value: KeqTimeout): Keq<T>
}

type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never
type FirstArgType<T> = T extends (arg1: infer P, ...args: any[]) => any ? P : never
type ExcludeNever<T> = Pick<T, { [K in keyof T]: T[K] extends never ? never : K }[keyof T]>

export type KeqOptionsParameter = ExcludeNever<{
  [key in keyof KeqOptions<any>]?: FirstArgType<KeqOptions<any>[key]>
}>

export type KeqOptionsReturnType<T> = ExcludeNever<{
  [key in keyof KeqOptions<T>]: ReturnType<KeqOptions<T>[key]>
}>
