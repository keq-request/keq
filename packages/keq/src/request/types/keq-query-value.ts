export type KeqQueryPrimitive = string | number | null | bigint | undefined
export type KeqQueryObject = { [key in string]: KeqQueryValue }
export type KeqQueryArray = KeqQueryValue[]
export type KeqQueryValue = KeqQueryPrimitive | KeqQueryArray | KeqQueryObject
