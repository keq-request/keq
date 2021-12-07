import { KeqURL } from './keq-url'
import { KeqBody } from './keq-body'
import { RequestMethod } from './request-method'
import { Options } from './options'


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
