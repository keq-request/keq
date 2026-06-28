import 'reflect-metadata'
import { expect, test } from '@jest/globals'
import { Module } from '@nestjs/common'
import type { ModulesContainer } from '@nestjs/core'
import { KeqModule, validateConfigureKeqMiddlewareImports } from '../src/keq.module.js'

/**
 * 模拟 NestJS Module wrapper 的运行时结构。
 * NestJS 在扫描阶段会将 DynamicModule 的 imports 解析为 Set<Module>，
 * 因此使用 imports Set 而非静态 Reflect.getMetadata 来校验。
 */
function createMockModule(metatype: unknown, importsModules: Array<{ metatype: unknown }> = []) {
  return {
    metatype,
    imports: new Set(importsModules),
  }
}

function mockModulesContainer(
  modules: Array<ReturnType<typeof createMockModule>>,
): ModulesContainer {
  const map = new Map()
  for (const mod of modules) {
    map.set(Symbol('module'), mod)
  }
  return map as unknown as ModulesContainer
}


test('throws when configureKeqMiddleware is declared without KeqModule in imports', () => {
  @Module({ imports: [] })
  class BadModule {
    configureKeqMiddleware(): void {}
  }

  const container = mockModulesContainer([
    createMockModule(KeqModule),
    createMockModule(BadModule),
  ])

  expect(() => validateConfigureKeqMiddlewareImports(container)).toThrow(
    /\[KeqModule\] 'BadModule' implements configureKeqMiddleware\(\)/,
  )
})

test('passes when configureKeqMiddleware is declared with KeqModule in imports', () => {
  @Module({ imports: [KeqModule] })
  class GoodModule {
    configureKeqMiddleware(): void {}
  }

  const keqModuleWrapper = createMockModule(KeqModule)

  const container = mockModulesContainer([
    keqModuleWrapper,
    createMockModule(GoodModule, [keqModuleWrapper]),
  ])

  expect(() => validateConfigureKeqMiddlewareImports(container)).not.toThrow()
})

test('passes when module does not implement configureKeqMiddleware', () => {
  @Module({ imports: [] })
  class PlainModule {}

  const container = mockModulesContainer([
    createMockModule(PlainModule),
  ])

  expect(() => validateConfigureKeqMiddlewareImports(container)).not.toThrow()
})

test('passes when KeqModule is imported as DynamicModule', () => {
  @Module({ imports: [{ module: KeqModule }] })
  class DynamicImportModule {
    configureKeqMiddleware(): void {}
  }

  // NestJS 在扫描阶段解析 DynamicModule，将 KeqModule wrapper 加入 imports Set
  const keqModuleWrapper = createMockModule(KeqModule)

  const container = mockModulesContainer([
    keqModuleWrapper,
    createMockModule(DynamicImportModule, [keqModuleWrapper]),
  ])

  expect(() => validateConfigureKeqMiddlewareImports(container)).not.toThrow()
})

test('passes when KeqModule is imported via forwardRef', () => {
  const { forwardRef } = require('@nestjs/common')
  @Module({ imports: [forwardRef(() => KeqModule)] })
  class ForwardRefModule {
    configureKeqMiddleware(): void {}
  }

  // NestJS 在扫描阶段解析 forwardRef，将 KeqModule wrapper 加入 imports Set
  const keqModuleWrapper = createMockModule(KeqModule)

  const container = mockModulesContainer([
    keqModuleWrapper,
    createMockModule(ForwardRefModule, [keqModuleWrapper]),
  ])

  expect(() => validateConfigureKeqMiddlewareImports(container)).not.toThrow()
})

test('passes when metatype is null', () => {
  const container = mockModulesContainer([
    createMockModule(null as unknown as undefined),
  ])

  expect(() => validateConfigureKeqMiddlewareImports(container)).not.toThrow()
})

test('throws when module has configureKeqMiddleware but KeqModule is not in container', () => {
  // KeqModule 未在 ModulesContainer 中注册时，任何实现了 configureKeqMiddleware
  // 的模块都无法通过校验，因为缺少 KeqModule 来注册中间件
  @Module({ imports: [] })
  class SomeModule {
    configureKeqMiddleware(): void {}
  }

  const container = mockModulesContainer([
    createMockModule(SomeModule),
  ])

  expect(() => validateConfigureKeqMiddlewareImports(container)).toThrow(
    /\[KeqModule\] 'SomeModule'/,
  )
})

test('throws for one module while another is valid', () => {
  @Module({ imports: [] })
  class BadModule {
    configureKeqMiddleware(): void {}
  }

  @Module({ imports: [KeqModule] })
  class GoodModule {
    configureKeqMiddleware(): void {}
  }

  const keqModuleWrapper = createMockModule(KeqModule)

  const container = mockModulesContainer([
    keqModuleWrapper,
    createMockModule(GoodModule, [keqModuleWrapper]),
    createMockModule(BadModule),
  ])

  expect(() => validateConfigureKeqMiddlewareImports(container)).toThrow(
    /'BadModule'/,
  )
})
