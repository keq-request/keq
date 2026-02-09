
import { KeqRequest } from 'keq'
import { DynamicModule, Global, Provider } from '@nestjs/common'
import { ASYNC_OPTIONS_TYPE, ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from './keq.module-definition.js'
import { KeqModuleOptions } from './types/index.js'


/**
 * Provider that creates and configures a KeqRequest instance
 * Applies any middlewares defined in the module options
 */
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

/**
 * KeqModule - Dynamic module for integrating Keq HTTP client with NestJS
 *
 * This module is global, so KeqRequest can be injected anywhere in your application
 * without needing to import the module in every feature module.
 *
 * @example
 * ```typescript
 * // Synchronous registration
 * KeqModule.register({
 *   middlewares: [...]
 * })
 *
 * // Asynchronous registration
 * KeqModule.registerAsync({
 *   imports: [ConfigModule],
 *   useFactory: (config: ConfigService) => ({
 *     middlewares: [...]
 *   }),
 *   inject: [ConfigService]
 * })
 *
 * // Inject in service
 * class UserService {
 *   constructor(private readonly keqRequest: KeqRequest) {}
 *   async getUser(id: string) {
 *     return await this.keqRequest.get(`/users/${id}`).resolveWith('json')
 *   }
 * }
 * ```
 */
@Global()
export class KeqModule extends ConfigurableModuleClass {
  /**
   * Register the module with synchronous options
   * @param options - Configuration options including middlewares
   * @returns DynamicModule with KeqRequest provider
   */
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    const mo = super.register(options)
    mo.providers!.push(requestProvider)
    mo.global = true

    return mo
  }

  /**
   * Register the module with asynchronous options
   * Useful when you need to inject dependencies like ConfigService
   * @param options - Async configuration options
   * @returns DynamicModule with KeqRequest provider
   */
  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const mo = super.registerAsync(options)
    mo.providers!.push(requestProvider)
    mo.global = true

    return mo
  }
}
