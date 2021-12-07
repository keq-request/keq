import { isBlob } from '.'
import { isBrowser } from './is-browser'


export function isFile(object: any): boolean {
  if (isBrowser()) return object instanceof Blob

  return object instanceof Buffer || isBlob(object)
}
