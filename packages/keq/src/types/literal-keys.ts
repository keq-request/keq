/**
 * Extracts only the literal keys from an object type T.
 *
 * @example
 * ```ts
 * type Example = {
 *   [key: string]: number;
 *   knownProp: string;
 * }
 *
 * type Result = LiteralKeys<Example>;
 * // Result is { knownProp: string; }
 * ```
 */
export type LiteralKeys<T> = {
  [K in keyof T as
  K extends string ? (string extends K ? never : K)
    : K extends number ? (number extends K ? never : K)
      : K extends symbol ? (symbol extends K ? never : K)
        : never
  ]: T[K];
}
