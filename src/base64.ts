import { isBrowser } from './utils'

export function encodeBase64(str: string): string {
  return isBrowser ? btoa(str) : new Buffer(str).toString('base64')
}
