import { KeqBody } from './serialize'

/**
 * inferred Content-type from the body
 */
export function getTypeByBody(body: KeqBody): string {
  if (!body) return 'text/plain'
  if (typeof body === 'object') return 'application/json'
  return 'application/x-www-form-urlencoded'
}
