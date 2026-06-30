import type { Type } from '@nestjs/common'
import type { KEQ_ROUTES } from '../constants.js'
import type { KeqMiddlewareConsumer } from '../keq-middleware-consumer.js'
import type { KeqConsumer } from '../keq-consumer.js'


export interface KeqRouteInfo {
  host?: string
  method?: string
  pathname?: string
}

export interface KeqModuleClass extends Type<any> {
  readonly KEQ_REQUEST: symbol
  readonly KEQ_CONSUMER: symbol
}

/** forRoutes() 接受的路由目标（不再包含 KeqModuleClass，模块绑定通过 @InjectKeqConsumer 实现） */
export type KeqRouteTarget = typeof KEQ_ROUTES.ALL | KeqRouteInfo

export interface KeqMiddlewareConfigProxy {
  exclude(...routes: KeqRouteInfo[]): KeqMiddlewareConfigProxy
  forRoutes(...routes: KeqRouteTarget[]): KeqMiddlewareConsumer
}

/** 模块绑定 Consumer 的配置代理，forRoutes() 返回 KeqConsumer<T> */
export interface KeqScopedConfigProxy<T = KeqModuleClass> {
  exclude(...routes: KeqRouteInfo[]): KeqScopedConfigProxy<T>
  forRoutes(...routes: KeqRouteTarget[]): KeqConsumer<T>
}
