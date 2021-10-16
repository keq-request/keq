import { UrlWithParsedQuery } from 'url'
import { KeqBody } from './serialize'


export type RequestMethod = 'get' | 'post' | 'put' | 'delete' | 'head' | 'patch'
export interface KeqURL extends UrlWithParsedQuery {
  params: Record<string, string | number>
}

export interface RequestContext {
  url: KeqURL
  method: RequestMethod
  body: KeqBody
  headers: Headers

  // Additional Fetch API options
  options: Record<string, any>
}

export interface BuildInOptions {
  /**
   * replace the default fetch api
   * default use cross-fetch
   * https://www.npmjs.com/package/cross-fetch
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
  redirect?: 'follow' | 'error' | 'manual'

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

interface BaseOptions extends BuildInOptions {
  /** options extends by middleware */
  [key: string]: any
}

export interface OptionsWithFullResponse extends BaseOptions {
  resolveWithFullResponse: true
}

export interface OptionsWithoutFullResponse extends BaseOptions {
  resolveWithFullResponse?: false
}

export type Options = OptionsWithFullResponse | OptionsWithoutFullResponse

export interface Context {
  request: RequestContext
  res?: Response

  /** the result get by user */
  output: any

  options: Required<Options>

  /** delegate res */
  response?: Response

  /** delegate request */
  url: RequestContext['url']
  query: RequestContext['url']['query']
  headers: RequestContext['headers']
  body: RequestContext['body']

  /** extends by middleware */
  [key: string]: any
}
