import { IsUnknown } from 'type-fest'

/**
 * Exclude properties with `unknown` type from an object type `T`.
 *
 * @example
 * ```ts
 * type Original = {
 *   knownProp: string;
 *   unknownProp: unknown;
 * }
 *
 * type Result = ExcludeUnknownProperties<Original>;
 * // Result is { knownProp: string; }
 * ```
 */
export type NeverizeUnknownProperties<T extends object> = {
  [K in keyof T as IsUnknown<T[K]> extends true ? never : K]: T[K]
}
