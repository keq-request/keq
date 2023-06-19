import { OUTPUT_PROPERTY } from '~/constant'
import { KeqURL } from '../keq-url'
import { KeqBody } from './keq-body'
import { Options } from './options'
import { RequestMethod } from './request-method'


export interface RequestContext {
  url: KeqURL
  method: RequestMethod
  body: KeqBody
  headers: Headers

  // Additional Fetch API options
  options: Record<string, any>
}

export interface Context {
  request: RequestContext
  res?: Response

  /** the result get by user */
  output: any
  [OUTPUT_PROPERTY]?: any

  options: Required<Pick<Options, 'fetchAPI'>> & Options

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
