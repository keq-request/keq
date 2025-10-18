export function toFormData(body: object): FormData {
  const form = new FormData()

  for (const [key, value] of Object.entries(body)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        form.append(key, v)
      }
    } else {
      form.append(key, value)
    }
  }

  return form
}
