import { KeqRequestMethod } from '~/request-init'
import { KeqApiSchema } from './api-schema'
import { KeqOperation } from './operation'
import { IsUnion } from 'type-fest'


/**
 * Extract operations by method from API schema
 *
 * @example
 * ```
 * type MyApiSchema = {
 *   '/users': {
 *     get: { ... }
 *     post: { ... }
 *   }
 * }
 *
 * type GetOperations = ExtractMethodOperations<MyApiSchema, 'get'>
 * // Result:
 * // {
 * //   '/users': { ... }
 * // }
 *
 * // Union method results in never
 * type NeverOperations = ExtractMethodOperations<MyApiSchema, 'put' | 'delete'>
 * // Result: never
 * ```
 */
export type ExtractMethodOperations<T extends KeqApiSchema, M extends KeqRequestMethod> = IsUnion<M> extends true ? never : {
  [P in keyof T as T[P][M] extends KeqOperation ? P : never]: T[P][M] extends KeqOperation ? T[P][M] : never
}
