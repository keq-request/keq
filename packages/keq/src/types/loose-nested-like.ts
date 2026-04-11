import { StringIndexValueOf } from './string-index-value-of'

/**
 * Recursively maps a nested structure `T` so that every leaf value becomes `V`.
 * Arrays and objects are traversed recursively; primitive leaves are replaced with `V`.
 *
 * @example
 * ```ts
 * // Scalar → replaced by V
 * type A = LooseNestedLike<string, number>;
 * // string
 *
 * // Array → each element is recursively mapped
 * type B = LooseNestedLike<string, [number, boolean]>;
 * // [string, string]
 *
 * // Nested object → every leaf becomes V
 * type C = LooseNestedLike<string, { a: number; b: { c: boolean } }>;
 * // { a: string; b: { c: string } }
 * ```
 */
export type LooseNestedLike<V, T>
  = T extends any[] ? { [I in keyof T]: LooseNestedLike<V, T[I]> }
    : T extends object ? { [K in keyof T]: LooseNestedLike<V, T[K]> }
      : V


/**
 * Conditional guard that resolves to `unknown` when `T` is structurally compatible
 * with `LooseNestedLike<V, T>`, and `never` otherwise.
 * Useful as a constraint in generic parameters to ensure a value matches
 * the expected nested shape.
 *
 * @example
 * ```ts
 * // T's leaves are all assignable to string → passes
 * type Ok = EnableLooseNestedLike<string, { a: string; b: { c: string } }>;
 * // unknown
 *
 * // T contains a leaf (number) not assignable to string → fails
 * type Fail = EnableLooseNestedLike<string, { a: string; b: { c: number } }>;
 * // never
 * ```
 */
export type EnableLooseNestedLike<V, T> = T extends LooseNestedLike<V, T> ? unknown : never

/**
 * Maps each property of `U` through `LooseNestedLike`, using the string-index
 * value type of `T` as the leaf replacement type.
 * Commonly used to validate that a user-supplied object `U` has the same nested
 * shape but with values drawn from `T`'s string index signature.
 *
 * @example
 * ```ts
 * type Schema = { [key: string]: string | number };
 *
 * type Input = {
 *   name: string;
 *   meta: { tag: boolean };
 * };
 *
 * type Result = LooseNestedObject<Schema, Input>;
 * // { name: string | number; meta: { tag: string | number } }
 * ```
 */
export type LooseNestedObject<T, U> = {
  [K in keyof U]: LooseNestedLike<StringIndexValueOf<T>, U[K]>;
}
