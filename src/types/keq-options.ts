import { KeqFlowControl } from './keq-flow-control.js'
import { KeqResolveMethod } from './keq-resolve-with-mode.js'
import { KeqRetryDelay } from './keq-retry-delay'
import { KeqRetryOn } from './keq-retry-on'
import { KeqTimeout } from './keq-timeout.js'

export interface KeqBuildInOptions {
  /**
   * replace the default fetch api
   * default use node-fetch@2 in node and window.fetch in browser
   */
  fetchAPI?: typeof fetch

  /**
   * get response object, defaulted `false`
   * @deprecated use `resolveWith` instead
   * */
  resolveWithFullResponse?: boolean

  /**
   * how to resolve the response body
   * @description 如何解析响应体
   * @default 'intelligent'
   */
  resolveWith?: KeqResolveMethod

  /**
   * The request retry times
   * @description 重试次数
   */
  retryTimes?: number

  /**
   * The request retry interval time
   * @description 重试间隔时间
   */
  retryDelay?: KeqRetryDelay

  /**
   * Custom retry condition
   * @description 自定义重试条件
   */
  retryOn?: KeqRetryOn

  module?: {
    name: string
    pathname: string
  }

  flowControl?: KeqFlowControl

  timeout?: KeqTimeout
}

export interface KeqOptionsWithFullResponse extends KeqBuildInOptions {
  resolveWithFullResponse: true
  [key: string]: any
}

export interface KeqOptionsWithoutFullResponse extends KeqBuildInOptions {
  resolveWithFullResponse?: false
  [key: string]: any
}

export type KeqOptions = KeqOptionsWithFullResponse | KeqOptionsWithoutFullResponse
