import type { Type } from '@nestjs/common'
import type { KeqMiddleware } from 'keq'
import type { KEQ_ROUTES } from '../constants.js'
import type { KeqNestMiddleware } from './keq-nest-middleware.interface.js'


export interface KeqRouteInfo {
  host?: string
  method?: string
  pathname?: string
}

export interface KeqModuleClass {
  readonly KEQ_REQUEST: symbol
}

export interface KeqMiddlewareConfigProxy {
  exclude(...routes: KeqRouteInfo[]): KeqMiddlewareConfigProxy
  forRoutes(...routes: Array<typeof KEQ_ROUTES.ALL | KeqRouteInfo | KeqModuleClass>): KeqMiddlewareConsumer
}

export interface KeqMiddlewareConsumer {
  apply(...middlewares: Array<Type<KeqNestMiddleware> | KeqMiddleware>): KeqMiddlewareConfigProxy
}
