import { KeqContext, KeqNext } from 'keq'
import { StrategyOptions } from './strategies-options.js'


export interface KeqCacheStrategy {
  (options: StrategyOptions): (ct: KeqContext, next: KeqNext) => Promise<void>
}
