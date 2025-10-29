import { KeqRequestMethod } from '~/request-init'
import { KeqApiSchema } from './api-schema'
import { KeqOperation } from './operation'

/**
 * @example
 * ```
 * type API_SCHEMA = {
 *   '/users/{userId}': {
 *     get: {
 *       operationId: 'getUser'
 *       ...
 *     }
 *     post: {
 *       operationId: 'postUser'
 *       ...
 *     }
 *   }
 * }
 *
 * // Select specific method
 * type GetUserOperation = ApiSchemaSelect<API_SCHEMA, '/users/{userId}', 'get'>
 * // {
 * //   operationId: 'getUser'
 * //   ...
 * // }
 *
 * // Select entire path object
 * type UserPathOperations = ApiSchemaSelect<API_SCHEMA, '/users/{userId}'>
 * // {
 * //   get: { operationId: 'getUser', ... }
 * //   post: { operationId: 'postUser', ... }
 * // }
 * ```
 */
export type ApiSchemaSelect<
  T extends KeqApiSchema,
  P extends keyof T,
  M extends KeqRequestMethod | undefined = undefined,
>
  = M extends KeqRequestMethod
    ? T extends {
      [Path in keyof T as Path extends P ? Path : never]: {
        [Method in keyof T[Path] as Method extends M ? Method : never]: infer R
      }
    } ? R extends KeqOperation ? R : never : never
    : T extends {
      [Path in keyof T as Path extends P ? Path : never]: infer PathObj
    } ? PathObj : never
