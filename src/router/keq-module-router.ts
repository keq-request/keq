import { Exception } from '~/exception/exception'
import { composeMiddleware } from '~/middleware'
import { KeqMiddleware } from '~/types/keq-middleware'
import { KeqRouter } from './keq-router'


export class KeqModuleRouter extends KeqRouter {
  moduleName: string

  constructor(moduleName: string, middlewares: KeqMiddleware[]) {
    if (moduleName === '') {
      throw new Exception('Module name should not be empty')
    }

    super(middlewares)

    this.moduleName = moduleName
  }

  routes(): KeqMiddleware {
    return async (ctx, next) => {
      if (ctx.options.module?.name === this.moduleName) {
        await composeMiddleware(this.middlewares)(ctx, next)
      } else {
        await next()
      }
    }
  }
}
