/**
 * A utility type that evaluates to `unknown` if the type `T` has a string index signature,
 * otherwise it evaluates to `never`.
 *
 * @example
 * ```ts
 * type WithStringIndex = {
 *   [key: string]: number;
 *   knownProp: string;
 * }
 *
 * type WithoutStringIndex = {
 *   knownProp: string;
 *   anotherProp: number;
 * }
 *
 * type Result1 = EnabledIfStringIndex<WithStringIndex>;
 * // Result1 is unknown
 * type Result2 = EnabledIfStringIndex<WithoutStringIndex>;
 * // Result2 is never
 * ```
 */
export type EnabledIfStringIndex<T> = string extends keyof T ? unknown : never
