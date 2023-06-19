import {
  Middleware,
  MiddlewareMatcher,
  Options,
  RequestCreator,
  RequestParams,
} from '~/types'
import { Keq } from '../keq'
import { KeqURL } from '../keq-url'
import { matchHost, matchMiddleware } from '../middleware'


const defaultOptions: Options = {}

export function createRequest(): RequestCreator {
  const middlewares: Middleware[] = []

  const request: RequestCreator = function<T>(params: RequestParams, options: Options = defaultOptions): ReturnType<Keq<T>['options']> {
    const request = new Keq<T>(new KeqURL(params.url), 'get', [...middlewares])
    return request.options(options)
  }


  request.get = function<T>(href: string): Keq<T> {
    const request = new Keq<T>(new KeqURL(href), 'get', [...middlewares])
    return request
  }

  request.put = function<T>(href: string): Keq<T> {
    const request = new Keq<T>(new KeqURL(href), 'put', [...middlewares])
    return request
  }

  request.delete = function<T>(href: string): Keq<T> {
    const request = new Keq<T>(new KeqURL(href), 'delete', [...middlewares])
    return request
  }

  request.del = request.delete

  request.post = function<T>(href: string): Keq<T> {
    const request = new Keq<T>(new KeqURL(href), 'post', [...middlewares])
    return request
  }

  request.head = function<T>(href: string): Keq<T> {
    const request = new Keq<T>(new KeqURL(href), 'head', [...middlewares])
    return request
  }

  request.patch = function<T>(href: string): Keq<T> {
    const request = new Keq<T>(new KeqURL(href), 'patch', [...middlewares])
    return request
  }


  request.use = function use(m: MiddlewareMatcher | string | Middleware, middleware?: Middleware): RequestCreator {
    if (!middleware) middlewares.push(m as Middleware)
    else if (typeof m === 'string') middlewares.push(matchMiddleware(matchHost(m), middleware))
    else middlewares.push(matchMiddleware(m as MiddlewareMatcher, middleware))

    return request
  }

  request.create = createRequest

  return request
}
