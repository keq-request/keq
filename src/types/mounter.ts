import { MiddlewareMatcher } from './middleware'
import { RequestMethod } from './request-method'


export interface Mounter extends MiddlewareMatcher {
  method(method: RequestMethod): Mounter
  pathname(matcher: string | RegExp): Mounter
  location(): Mounter
  host(host: string): Mounter
  module(moduleName: string): Mounter
}

