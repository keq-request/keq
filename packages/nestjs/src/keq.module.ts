import { Global, Module, OnModuleInit, Type } from '@nestjs/common'
import { ModulesContainer } from '@nestjs/core'
import { KeqRequest } from 'keq'
import { KeqMiddlewareConsumerImpl } from './keq-middleware-consumer.js'
import { hasConfigureKeqMiddleware } from './utils/has-configure-keq-middleware.js'

/**
 * 全局标记，用于跨 KeqModule 实例去重
 *
 * 当 pnpm 等包管理器因为 peerDependencies 版本差异生成多个
 * `@keq-request/nestjs` 的 `.pnpm` 目录时，Node.js 会将它们视为不同模块，
 * 产生多个 `KeqModule` 类引用，导致 NestJS 创建多个 `KeqModule` 实例。
 *
 * 每个实例的 `onModuleInit()` 都会遍历 `ModulesContainer` 并调用所有
 * 实现了 `configureKeqMiddleware` 的模块。通过 `Symbol.for()`（全局 Symbol
 * 注册表）在 `moduleWrapper.metatype` 上做标记，确保同一个模块类
 * 只被处理一次，无论有多少个 `KeqModule` 实例。
 */
const CONFIGURED_SYMBOL = Symbol.for('__keq_middleware_configured__')

/**
 * 在 NestJS 模块初始化早期阶段校验 `configureKeqMiddleware` 的实现模块
 * 是否显式导入了 `KeqModule`。
 *
 * NestJS 初始化分为两个严格串行的阶段：
 * 1. 全量扫描 — 所有模块 wrapper 加入 ModulesContainer，metatype 已设置，
 *    DynamicModule 的 imports 已被解析并写入 moduleWrapper.imports Set
 * 2. 实例创建 — 按依赖顺序调用构造函数 → onModuleInit
 *
 * 此校验在阶段 2 开头（构造函数中）执行，早于所有 onModuleInit，
 * 确保中间件缺失问题在启动期就被捕获，而非在业务模块 onModuleInit 发请求时静默失效。
 *
 * 使用运行时 imports Set 而非 Reflect.getMetadata('imports', metatype) 的原因：
 * - DynamicModule 通过 register() 返回的 imports 不在静态装饰器元数据中
 * - 从 ModulesContainer 获取 KeqModule metatype 可避免 pnpm 重复包实例导致的 === 比对失败
 */
export function validateConfigureKeqMiddlewareImports(modulesContainer: ModulesContainer): void {
  // 从 ModulesContainer 中查找 KeqModule 的 metatype，
  // 解决 pnpm 下 @keq-request/nestjs 存在多个包实例导致 === 引用比对失败的问题
  let keqModuleMetatype: Type<any> | undefined
  for (const [, moduleWrapper] of modulesContainer) {
    if (moduleWrapper.metatype?.name === 'KeqModule') {
      keqModuleMetatype = moduleWrapper.metatype
      break
    }
  }

  for (const [, moduleWrapper] of modulesContainer) {
    const metatype = moduleWrapper.metatype
    if (typeof metatype?.prototype?.configureKeqMiddleware !== 'function') continue

    // 使用运行时 imports Set（NestJS 扫描阶段已解析 DynamicModule 的 imports），
    // 替代 Reflect.getMetadata('imports', metatype)，解决：
    // 1. DynamicModule 的 imports 无法通过静态元数据检测
    // 2. 重复包实例导致的类引用不匹配
    const hasKeqModule = [...moduleWrapper.imports].some(
      (importedModule) => importedModule.metatype === keqModuleMetatype,
    )

    if (!hasKeqModule) {
      throw new Error(
        `[KeqModule] '${metatype.name}' implements configureKeqMiddleware() `
        + 'but does not explicitly import KeqModule. '
        + 'Add \'imports: [KeqModule]\' to its @Module() decorator to ensure '
        + 'middleware is registered before the module\'s onModuleInit() runs.',
      )
    }
  }
}

@Global()
@Module({
  providers: [{ provide: KeqRequest, useFactory: () => new KeqRequest() }],
  exports: [KeqRequest],
})
export class KeqModule implements OnModuleInit {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly keqRequest: KeqRequest,
  ) {
    validateConfigureKeqMiddlewareImports(modulesContainer)
  }

  onModuleInit(): void {
    for (const [, moduleWrapper] of this.modulesContainer) {
      const instance = moduleWrapper.instance
      if (!hasConfigureKeqMiddleware(instance)) continue

      // 跨 KeqModule 实例去重：
      // moduleWrapper.metatype 是同一个类引用，Symbol.for 是全局共享 key
      if (moduleWrapper.metatype[CONFIGURED_SYMBOL]) continue
      moduleWrapper.metatype[CONFIGURED_SYMBOL] = true

      const consumer = new KeqMiddlewareConsumerImpl()
      instance.configureKeqMiddleware(consumer)
      consumer.applyTo(this.keqRequest, this.modulesContainer)
    }
  }
}
