import { Exception } from '../exception/exception.js'

import type { KeqRoute } from './types/keq-route.js'


/**
 * @deprecated This function exists solely for backward compatibility with v2.
 */
export function keqModuleRoute(moduleName: string): KeqRoute {
  if (!moduleName) {
    throw new Exception('Module name should not be empty')
  }

  return (ctx) => ctx.options.module?.name === moduleName
}
