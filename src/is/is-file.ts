/* eslint-disable @typescript-eslint/no-explicit-any */
import { isBlob } from './is-blob.js'
import { isBrowser } from './is-browser.js'


export function isFile(object: any): object is File {
  if (isBrowser()) return object instanceof Blob

  return isBlob(object)
}
