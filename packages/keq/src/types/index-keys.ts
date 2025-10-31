/**
 * Extracts the index signature keys of an object type T.
 *
 * @example
 * ```ts
 * type Example = {
 *   [key: string]: number;
 *   knownProp: string;
 * }
 *
 * type Result = IndexKeys<Example>;
 * // Result is { [key: string]: number; }
 * ```
 */
export type IndexKeys<T> = {
  [P in keyof T as
  string extends P ? P
    : number extends P ? P
      : symbol extends P ? P
        : never
  ]: T[P];
}
