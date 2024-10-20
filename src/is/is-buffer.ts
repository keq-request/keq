/* eslint-disable @typescript-eslint/no-explicit-any */
import { isBrowser } from './is-browser.js'


export function isBuffer(obj: any): obj is Buffer {
  return isBrowser() ? false : Buffer.isBuffer(obj)
}
