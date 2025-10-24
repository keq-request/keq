import { KeqContext } from 'keq'
import { KeqCacheOption } from './keq-cache-option.js'


export interface KeqCacheRule extends KeqCacheOption {
  pattern?: RegExp | ((ctx: KeqContext) => boolean) | true
}
