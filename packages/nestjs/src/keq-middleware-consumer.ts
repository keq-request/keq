import { Injectable } from '@nestjs/common'
import type { KeqMiddleware } from 'keq'
import { KeqRequest } from 'keq'
import type { KeqMiddlewareConfigProxy } from './interfaces/keq-middleware-consumer.interface.js'
import type { KeqNestMiddleware } from './interfaces/keq-nest-middleware.interface.js'
import { KeqMiddlewareCollector } from './keq-middleware-collector.js'


/**
 * 全局中间件消费者，提供 `.apply().forRoutes()` API。
 *
 * `forRoutes()` 返回 `KeqMiddlewareConsumer` 自身，支持链式注册：
 *
 * ```ts
 * consumer
 *   .apply(mw1).forRoutes(KEQ_ROUTES.ALL)
 *   .apply(mw2).forRoutes({ pathname: '/api/*' })
 * ```
 *
 * 模块级别的中间件请使用 `@InjectKeqConsumer(GeneratedModule)` 注入
 * `KeqConsumer<GeneratedModule>`，其 `forRoutes()` 直接作用于目标模块。
 */
@Injectable()
export class KeqMiddlewareConsumer {
  constructor(private readonly keqRequest: KeqRequest) {}

  apply(
    ...middlewares: Array<KeqNestMiddleware | KeqMiddleware>
  ): KeqMiddlewareConfigProxy {
    const collector = new KeqMiddlewareCollector(this.keqRequest, this)
    return collector.apply(middlewares)
  }
}
