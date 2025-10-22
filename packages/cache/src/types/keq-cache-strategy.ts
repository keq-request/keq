import { KeqExecutionContext, KeqNext } from 'keq'
import { StrategyOptions } from './strategies-options.js'


export interface KeqCacheStrategy {
  (options: StrategyOptions): (context: KeqExecutionContext, next: KeqNext) => Promise<void>
}
