/**
 * Extracts the value type of string index signatures from an object type.
 *
 * @example
 * ```ts
 * type Example = {
 *   [key: string]: number | string;
 *   knownProp: number;
 * }
 *
 * type Result = StringIndexValueOf<Example>;
 * // Result is number | string
 * ```
 */
export type StringIndexValueOf<T>
  = string extends keyof T
    ? T extends { [key: string]: infer V } ? V : never
    : never
