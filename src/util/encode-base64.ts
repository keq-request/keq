import { isBrowser } from '@/util'


export function encodeBase64(str: string): string {
  return isBrowser() ? btoa(str) : Buffer.from(str).toString('base64')
}
