import { Exception } from '~/exception/exception.js'
import { KeqRoute } from '~/types/keq-route.js'


export function keqModuleRoute(moduleName: string): KeqRoute {
  if (!moduleName) {
    throw new Exception('Module name should not be empty')
  }

  return (ctx) => ctx.options.module?.name === moduleName
}
