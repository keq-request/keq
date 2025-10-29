import { KeqApiSchema } from './types'
import { KeqRequest, KeqRequestOptions } from './request'


/**
 * @deprecated use new KeqRequest<SCHEMA>(options) instead
 */
export function createRequest<SCHEMA extends KeqApiSchema>(options?: KeqRequestOptions): KeqRequest<SCHEMA> {
  return new KeqRequest<SCHEMA>(options)
}
