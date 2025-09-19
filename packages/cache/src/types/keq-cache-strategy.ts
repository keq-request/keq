import { KeqContext, KeqNext } from 'keq'
import { StrategyOptions } from './strategies-options'


export interface KeqCacheStrategy {
  (options: StrategyOptions): (ct: KeqContext, next: KeqNext) => Promise<void>
}
