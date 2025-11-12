import { StringIndexValueOf } from './string-index-value-of'

export type LooseNestedLike<V, T>
  = T extends any[] ? { [I in keyof T]: LooseNestedLike<V, T[I]> }
    : T extends object ? { [K in keyof T]: LooseNestedLike<V, T[K]> }
      : V


export type EnableLooseNestedLike<V, T> = T extends LooseNestedLike<V, T> ? unknown : never

export type LooseNestedObject<T, U> = {
  [K in keyof U]: LooseNestedLike<StringIndexValueOf<T>, U[K]>;
}
