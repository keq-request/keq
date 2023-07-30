import { KeqMiddleware } from './keq-middleware'
import { KeqRequestMethod } from './keq-request-method'


export interface RouterMap {
  host(host: string, ...middlewares: KeqMiddleware[]): RouterMap
  pathname(pathname: string, ...middlewares: KeqMiddleware[]): RouterMap
  method(method: KeqRequestMethod, ...middlewares: KeqMiddleware[]): RouterMap
  location(...middlewares: KeqMiddleware[]): RouterMap
  module(moduleName: string, ...middlewares: KeqMiddleware[]): RouterMap
}
