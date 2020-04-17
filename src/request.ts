import { Keq } from './keq'
import { RequestMethod, Options, OptionsWithoutFullResponse, OptionsWithFullResponse } from './context'
import url from 'url'
import clone from 'clone'
import { Middleware, MiddlewareMatcher, matchMiddleware, matchHost } from './middleware'


const defaultOptions: Options = {}

export interface Params {
  url: string
  method: RequestMethod
}

type CreateReqeustPromiseF = <T = any>(href: string) => Keq<T>

interface RequestCreator {
  <T = any>(params: Params, options?: OptionsWithoutFullResponse): Keq<T>
  (params: Params, options: OptionsWithFullResponse): Keq<Response>

  get: CreateReqeustPromiseF
  post: CreateReqeustPromiseF
  del: CreateReqeustPromiseF
  delete: CreateReqeustPromiseF
  put: CreateReqeustPromiseF
  patch: CreateReqeustPromiseF
  head: CreateReqeustPromiseF

  use(middleware: Middleware): RequestCreator
  use(matcher: string, middleware: Middleware): RequestCreator
  use(matcher: MiddlewareMatcher, middleware: Middleware): RequestCreator
  use(m: MiddlewareMatcher | string | Middleware, middleware?: Middleware): RequestCreator
}

const middlewares: Middleware[] = []

export const request: RequestCreator = function<T>(params: Params, options: Options = defaultOptions): ReturnType<Keq<T>['options']> {
  const urlObj = url.parse(params.url, true)
  const request = new Keq<T>(urlObj, 'get', middlewares)
  return request.options(options)
}


request.get = function<T>(href: string): Keq<T> {
  const urlObj = url.parse(href, true)
  const request = new Keq<T>(urlObj, 'get', clone(middlewares))
  return request
}

request.put = function<T>(href: string): Keq<T> {
  const urlObj = url.parse(href, true)
  const request = new Keq<T>(urlObj, 'put', middlewares)
  return request
}

request.delete = function<T>(href: string): Keq<T> {
  const urlObj = url.parse(href, true)
  const request = new Keq<T>(urlObj, 'delete', middlewares)
  return request
}

request.del = request.delete

request.post = function<T>(href: string): Keq<T> {
  const urlObj = url.parse(href, true)
  const request = new Keq<T>(urlObj, 'post', middlewares)
  return request
}

request.head = function<T>(href: string): Keq<T> {
  const urlObj = url.parse(href, true)
  const request = new Keq<T>(urlObj, 'head', middlewares)
  return request
}

request.patch = function<T>(href: string): Keq<T> {
  const urlObj = url.parse(href, true)
  const request = new Keq<T>(urlObj, 'patch', middlewares)
  return request
}


request.use = function use(m: MiddlewareMatcher | string | Middleware, middleware?: Middleware): RequestCreator {
  if (!middleware) middlewares.push(m as Middleware)
  else if (typeof m === 'string') middlewares.push(matchMiddleware(matchHost(m), middleware))
  else middlewares.push(matchMiddleware(m as MiddlewareMatcher, middleware))

  return request
}
