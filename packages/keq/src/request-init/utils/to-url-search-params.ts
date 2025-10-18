export function toUrlSearchParams(body: object): URLSearchParams {
  const params = new URLSearchParams()
  Object.entries(body).map(([key, value]) => {
    if (Array.isArray(value)) {
      for (const v of value) {
        params.append(key, v)
      }
    } else {
      params.append(key, value)
    }
  })

  return params
}
