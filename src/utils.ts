// /**
//  * Check if `obj` is a URLSearchParams object
//  *
//  * @param  {*} obj
//  * @return {boolean}
//  */
// export function isURLSearchParams(object): boolean {
//   return (
//     typeof object === 'object' &&
// 		typeof object.append === 'function' &&
// 		typeof object.delete === 'function' &&
// 		typeof object.get === 'function' &&
// 		typeof object.getAll === 'function' &&
// 		typeof object.has === 'function' &&
// 		typeof object.set === 'function' &&
//     typeof object.sort === 'function'
//   )
// }

import { isBlob } from './form-data-node/util/is'


export function isFormData(object: any): boolean {
  return (
    typeof object === 'object' &&
    typeof object.append === 'function' &&
		typeof object.delete === 'function' &&
    typeof object.get === 'function' &&
		typeof object.getAll === 'function' &&
		typeof object.has === 'function' &&
    typeof object.set === 'function' &&
    typeof object.entries === 'function' &&
    typeof object.keys === 'function' &&
    typeof object.values === 'function'
  )
}

export const isBrowser = typeof window !== 'undefined'

export function isFile(object: any): boolean {
  if (isBrowser) return object instanceof Blob

  return object instanceof Buffer || isBlob(object)
}
