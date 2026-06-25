export function isValidHeaderValue(str): boolean {
  const regex = /^[\t\x20-\x7E\x80-\xFF]*$/
  return regex.test(str)
}
