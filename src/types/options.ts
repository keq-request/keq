import { fetch } from '~/polyfill'


interface BaseOptions extends BuildInOptions {
  /** options extends by middleware */
  [key: string]: any
}

export interface BuildInOptions {
  /**
   * replace the default fetch api
   * default use node-fetch@2 in node and window.fetch in browser
   */
  fetchAPI?: typeof fetch

  /** get response object, defaulted `false` */
  resolveWithFullResponse?: boolean

  /**
   * The mode for how redirects are handled.
   * https://developer.mozilla.org/en-US/docs/Web/API/Request/redirect
   *
   * @defaulted 'follow'
   */
  redirect?: RequestRedirect

  /**
   * Indicates whether the user agent should send
   * or receive cookies from the other domain in the case of cross-origin requests.
   * https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
   */
  credentials?: RequestCredentials

  /**
   * Determine if cross-origin requests lead to valid responses,
   * and which properties of the response are readable.
   * https://developer.mozilla.org/en-US/docs/Web/API/Request/mode
   */
  mode?: RequestMode

  /**
   * get original object, defaulted `false`
   * resolveWithFullResponse has a higher priority than resolveWithOriginalResponse
   *
   * @descripted
   */
  resolveWithOriginalResponse?: boolean

  /**
   * the maximum number of bytes to store in the internal buffer
   * before ceasing to read from the underlying resource.
   *
   * @descripted
   */
  highWaterMark?: number
}

export interface OptionsWithFullResponse extends BaseOptions {
  resolveWithFullResponse: true
}

export interface OptionsWithoutFullResponse extends BaseOptions {
  resolveWithFullResponse?: false
}

export type Options = OptionsWithFullResponse | OptionsWithoutFullResponse
