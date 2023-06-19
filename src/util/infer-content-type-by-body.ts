import { KeqBody } from '~/types'


export function inferContentTypeByBody(body: KeqBody): string {
  if (!body) return 'text/plain'
  if (typeof body === 'object') return 'application/json'
  return 'application/x-www-form-urlencoded'
}
