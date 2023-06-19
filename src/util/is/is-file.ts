import { Blob } from '~/polyfill'
import { isBlob } from './is-blob'
import { isBrowser } from './is-browser'


export function isFile(object: any): object is File {
  if (isBrowser) return object instanceof Blob

  return isBlob(object)
}
