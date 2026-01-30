import * as R from 'ramda'

// 定义一个能推断多个对象合并结果的类型工具
type MergeAll<T extends unknown[]> = T extends [infer F, ...infer R]
  ? F & MergeAll<R>
  : Record<string, never>

/**
 * 对多个对象数组执行笛卡尔积合并
 * @example
 * xprodMerge([{ a: 1 }, { a: 2 }], [{b: 1}], [{ c: 1 }])
 * // => [{ a: 1, b: 1, c: 1}, { a: 2, b:1, c: 1 }]
 */
export function xprodMerge<T extends object[]>(
  ...lists: { [K in keyof T]: T[K][] }
): MergeAll<T>[] {
  if (lists.length === 0) return [] as MergeAll<T>[]
  if (lists.length === 1) return lists[0] as MergeAll<T>[]

  // 使用 reduce 和 R.chain 对所有数组执行笛卡尔积操作，并合并每个组合的对象
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = lists.reduce((acc: any[], curr: any[]) => R.chain((item1: Record<string, unknown>) => R.map((item2: Record<string, unknown>) => R.mergeAll([item1, item2]), curr), acc)) as MergeAll<T>[]

  return result
}
