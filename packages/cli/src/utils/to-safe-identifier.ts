import * as changeCase from 'change-case'

/**
 * Check if a string is a valid JavaScript/TypeScript identifier.
 */
export function isValidIdentifier(str: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str)
}

/**
 * Convert a string to a valid JavaScript/TypeScript identifier.
 * If the string is already a valid identifier, return it as-is.
 * Otherwise, convert it to camelCase and ensure it starts with a valid character.
 */
export function toSafeIdentifier(str: string): string {
  if (isValidIdentifier(str)) return str

  const camelCased = changeCase.camelCase(str)

  if (!camelCased) {
    return `_${str.replace(/[^a-zA-Z0-9_$]/g, '_')}`
  }

  // camelCase may produce a string starting with a digit (e.g. "123-get" -> "123Get")
  if (/^[0-9]/.test(camelCased)) {
    return `_${camelCased}`
  }

  if (!isValidIdentifier(camelCased)) {
    return `_${camelCased.replace(/[^a-zA-Z0-9_$]/g, '_')}`
  }

  return camelCased
}
