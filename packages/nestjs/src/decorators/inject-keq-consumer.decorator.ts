import { Inject } from '@nestjs/common'
import type { KeqModuleClass } from '../interfaces/keq-middleware-consumer.interface.js'


/**
 * 注入绑定到指定 Keq Module 的 `KeqConsumer<T>`。
 *
 * 被注入的 Module Class 必须同时包含 `KEQ_REQUEST` 和 `KEQ_CONSUMER` 静态属性，
 * 两者均由 keq CLI 生成。
 *
 * 使用方式：
 * ```ts
 * constructor(
 *   \@InjectKeqConsumer(GeneratedModule) consumer: KeqConsumer<GeneratedModule>,
 * ) {
 *   consumer.apply(mw).forRoutes('*')
 * }
 * ```
 *
 * @param moduleClass - 目标 KeqModule 类（需具有 `KEQ_REQUEST` 和 `KEQ_CONSUMER` symbol）
 */
export function InjectKeqConsumer<T extends KeqModuleClass>(
  moduleClass: T,
): ParameterDecorator {
  return Inject(moduleClass.KEQ_CONSUMER)
}
