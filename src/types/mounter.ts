import { MiddlewareMatcher } from './middleware'


export interface Mounter extends MiddlewareMatcher {
  pathname(matcher: string | RegExp): Mounter
  location(): Mounter
  host(host: string): Mounter
  module(moduleName: string): Mounter
}

