/* eslint-disable @typescript-eslint/no-unsafe-return */
import { KeqRequest } from 'keq'
import { DynamicModule, Provider } from '@nestjs/common'
import { ASYNC_OPTIONS_TYPE, KeqModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from './keq.module-definition.js'
import { KeqModuleOptions } from './types/index.js'


const requestProvider: Provider = {
  provide: KeqRequest,
  useFactory: (config: KeqModuleOptions) => {
    const request = new KeqRequest()

    if (config.middlewares) {
      for (const middleware of config.middlewares) {
        request.use(middleware)
      }
    }

    return request
  },
  inject: [MODULE_OPTIONS_TOKEN],
}

export class KeqModule extends KeqModuleClass {
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    const mo = super.register(options)
    mo.providers!.push(requestProvider)

    return mo
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const mo = super.registerAsync(options)
    mo.providers!.push(requestProvider)

    return mo
  }
}
