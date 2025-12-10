// import { KeqCacheRequestOptions } from './keq-cache-request-options.js'
import { RequestCacheOptions } from '~/request-cache-handler/index.js'
import { KeqCachePattern } from './keq-cache-pattern.js'


export interface KeqCacheRule extends RequestCacheOptions {
  pattern?: KeqCachePattern
}
