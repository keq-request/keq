import type { KeqMiddleware } from 'keq'
import { KeqRequest } from 'keq'
import type { KeqModuleClass, KeqScopedConfigProxy } from './interfaces/keq-middleware-consumer.interface.js'
import type { KeqNestMiddleware } from './interfaces/keq-nest-middleware.interface.js'
import { KeqMiddlewareCollector } from './keq-middleware-collector.js'


/**
 * 为指定 Keq 模块按路由注册中间件。
 *
 * Keq 模块由 `@keq-request/cli` 生成，通过
 * {@link InjectKeqConsumer} 装饰器注入本实例。
 *
 * @typeParam T - 目标模块类
 *
 * @example
 * ```ts
 * constructor(
 *   \@InjectKeqConsumer(GeneratedModule) consumer: KeqConsumer<GeneratedModule>,
 * ) {
 *   consumer.apply(authMw).forRoutes('*')
 * }
 * ```
 */
export class KeqConsumer<T = KeqModuleClass> {
  constructor(private readonly keqRequest: KeqRequest) {}

  apply(
    ...middlewares: Array<KeqNestMiddleware | KeqMiddleware>
  ): KeqScopedConfigProxy<T> {
    const collector = new KeqMiddlewareCollector(this.keqRequest, this)
    return collector.apply(middlewares) as unknown as KeqScopedConfigProxy<T>
  }
}
