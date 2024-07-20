import { FlattenOperations, KeqOperation, KeqOperations } from './keq-operation.js'

import type { KeqRouter } from '~/router/keq-router.js'
import type { Keq } from '~/keq.js'
import type { KeqMiddleware } from './keq-middleware.js'
import type { KeqInit } from './keq-init.js'

interface KeqRequestFn<OPERATIONS extends Record<string, KeqOperation>> {
  <Path extends keyof OPERATIONS>(url: Path): Keq<OPERATIONS[Path]['responseBody'], OPERATIONS[Path]>
  <OUTPUT = any>(url: string): Keq<OUTPUT>
  <OUTPUT = any>(url: URL): Keq<OUTPUT>
}


type PickKeqOperationsProperty<T extends KeqOperations, P extends keyof T, X extends keyof KeqOperation> = T extends {
  [Path in keyof T as Path extends P ? Path : never]: {
    [Method in keyof T[Path] as T[Path][Method] extends KeqOperation ? Method : never ]: infer R
  }
} ? R extends KeqOperation ? R[X] : never : never

export interface KeqRequest<OPERATIONS extends KeqOperations = KeqOperations> {
  <Path extends keyof OPERATIONS>(url: Path, init: Omit<KeqInit, 'global'>): Keq<Exclude<PickKeqOperationsProperty<OPERATIONS, Path, 'responseBody'>, undefined>>
  <OUTPUT = any>(url: string, init: Omit<KeqInit, 'global'>): Keq<OUTPUT>
  <OUTPUT = any>(url: URL, init: Omit<KeqInit, 'global'>): Keq<OUTPUT>

  baseOrigin: (baseOrigin: string) => void

  get: KeqRequestFn<FlattenOperations<OPERATIONS, 'get'>>
  post: KeqRequestFn<FlattenOperations<OPERATIONS, 'post'>>
  del: KeqRequestFn<FlattenOperations<OPERATIONS, 'delete'>>
  delete: KeqRequestFn<FlattenOperations<OPERATIONS, 'delete'>>
  put: KeqRequestFn<FlattenOperations<OPERATIONS, 'put'>>
  patch: KeqRequestFn<FlattenOperations<OPERATIONS, 'patch'>>
  head: KeqRequestFn<FlattenOperations<OPERATIONS, 'head'>>

  use(firstMiddleware: KeqMiddleware, ...middleware: KeqMiddleware[]): this
  useRouter(): KeqRouter
}
