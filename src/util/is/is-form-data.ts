export function isFormData(object: any): object is FormData {
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
