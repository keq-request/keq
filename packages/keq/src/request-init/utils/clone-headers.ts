export function cloneHeaders(headers: Headers): Headers {
  const cloned = new Headers()
  for (const [key, value] of headers.entries()) {
    cloned.append(key, value)
  }

  return cloned
}
