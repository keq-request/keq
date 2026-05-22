import { xprodMerge } from '../../utils/xprod-merge.js'
import type { FilterRule } from '../../utils/matcher.js'

export function xprodFilterRules(options: { module?: string[]; method?: string; pathname?: string; persist?: boolean }): FilterRule[] {
  return xprodMerge(
    (options.module || ['*']).map((moduleName) => ({ deny: false, persist: options.persist, moduleName })),
    options.method ? [{ operationMethod: options.method.toLowerCase() }] : [{ operationMethod: '*' }],
    options.pathname ? [{ operationPathname: options.pathname }] : [{ operationPathname: '/**' }],
  ) as unknown as FilterRule[]
}
