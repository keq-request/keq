export type KeqQueryPrimitive = string | number | bigint | null | undefined
export type KeqQueryObject<K extends string = string> = { [key in K]: KeqQueryValue }
export type KeqQueryArray = KeqQueryValue[]
export type KeqQueryValue = KeqQueryPrimitive | KeqQueryArray | KeqQueryObject
