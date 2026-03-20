/**
 * Override properties of Destination with properties from Source.
 *
 * Unlike type-fest's `Merge`, this uses only built-in TypeScript type
 * operations (`Omit` + `&`), ensuring the result remains transparent
 * to the type checker — property access like `Override<A, B>['key']`
 * resolves eagerly instead of producing opaque conditional types.
 *
 * @example
 * ```ts
 * type Base = { a: string; b: number; c: boolean }
 * type Result = Override<Base, { b: string }>
 * // Result is { a: string; b: string; c: boolean }
 * ```
 */
export type Override<Destination, Source> = Omit<Destination, keyof Source> & Source
