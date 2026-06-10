import { Global, Module, OnModuleInit } from '@nestjs/common'
import { ModulesContainer, ModuleRef } from '@nestjs/core'
import { KeqRequest } from 'keq'
import { KeqMiddlewareConsumerImpl } from './keq-middleware-consumer.js'
import { hasConfigureKeqMiddleware } from './utils/has-configure-keq-middleware.js'


@Global()
@Module({
  providers: [{ provide: KeqRequest, useFactory: () => new KeqRequest() }],
  exports: [KeqRequest],
})
export class KeqModule implements OnModuleInit {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly moduleRef: ModuleRef,
    private readonly keqRequest: KeqRequest,
  ) {}

  onModuleInit(): void {
    for (const [, moduleWrapper] of this.modulesContainer) {
      const instance = moduleWrapper.instance
      if (hasConfigureKeqMiddleware(instance)) {
        const consumer = new KeqMiddlewareConsumerImpl()
        instance.configureKeqMiddleware(consumer)
        consumer.applyTo(this.keqRequest, this.moduleRef)
      }
    }
  }
}
