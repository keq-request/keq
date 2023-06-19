import { Keq } from '~/keq'
import { Middleware, MiddlewareMatcher } from './middleware'
import { OptionsWithFullResponse, OptionsWithoutFullResponse } from './options'
import { RequestMethod } from './request-method'


export interface RequestParams {
  url: string
  method: RequestMethod
}

type CreateReqeustPromiseF = <T = any>(href: string) => Keq<T>

export interface RequestCreator {
  <T = any>(params: RequestParams, options?: OptionsWithoutFullResponse): Keq<T>
  (params: RequestParams, options: OptionsWithFullResponse): Keq<Response>

  get: CreateReqeustPromiseF
  post: CreateReqeustPromiseF
  del: CreateReqeustPromiseF
  delete: CreateReqeustPromiseF
  put: CreateReqeustPromiseF
  patch: CreateReqeustPromiseF
  head: CreateReqeustPromiseF

  create(): RequestCreator

  use(middleware: Middleware): RequestCreator
  use(matcher: string, middleware: Middleware): RequestCreator
  use(matcher: MiddlewareMatcher, middleware: Middleware): RequestCreator
  use(m: MiddlewareMatcher | string | Middleware, middleware?: Middleware): RequestCreator
}
