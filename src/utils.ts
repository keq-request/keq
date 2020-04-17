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


export function isFormData(object): boolean {
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

// export function isBlob(object): boolean {
//   return (
//     typeof object === 'object' &&
//     typeof object.slice === 'function' &&
//     typeof object.stream === 'function' &&
//     typeof object.text === 'function' &&
//     typeof object.arrayBuffer === 'function'
//   )
// }

export const isBrowser = typeof window !== 'undefined'

export function isFile(object): boolean {
  if (isBrowser) return object instanceof Blob
  else return object instanceof Buffer
}
