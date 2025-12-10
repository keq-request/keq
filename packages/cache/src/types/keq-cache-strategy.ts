import { KeqExecutionContext, KeqNext } from 'keq'
import { RequestCacheHandler } from '~/request-cache-handler'


export interface KeqCacheStrategy {
  (handler: RequestCacheHandler, context: KeqExecutionContext, next: KeqNext): Promise<void>
}
