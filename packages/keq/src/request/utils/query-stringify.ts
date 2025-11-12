/* eslint-disable @typescript-eslint/no-unsafe-return */
import qs, { IStringifyOptions } from 'qs'
import { KeqQueryObject, KeqQueryOptions, KeqQueryValue } from '../types'

function normalize(value: KeqQueryValue, options?: KeqQueryOptions): KeqQueryValue {
  if (Array.isArray(value)) {
    return value.map((v) => normalize(v, options))
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (typeof value === 'object' && value !== null) {
    const obj = { ...value }
    for (const key of Object.keys(obj)) {
      obj[key] = normalize(obj[key], options)
    }

    return obj
  }


  return value
}

export function queryStringify(query: KeqQueryObject, options?: KeqQueryOptions): string {
  const value = normalize(query, options)

  const opts: IStringifyOptions = {}


  if (options?.allowDots !== undefined) {
    opts.allowDots = options.allowDots
    // if (options.encodeDotInKeys !== undefined) {
    //   opts.encodeDotInKeys = options.encodeDotInKeys as any
    // }
  }

  if (options?.indices !== undefined) {
    opts.indices = options.indices
  }

  if (options?.arrayFormat === 'pipe') {
    opts.filter = (_, val) => {
      if (Array.isArray(val)) return val.join('|')
      return val
    }
  } else if (options?.arrayFormat === 'space') {
    opts.filter = (_, val) => {
      if (Array.isArray(val)) return val.join(' ')
      return val
    }
  } else if (options?.arrayFormat) {
    opts.arrayFormat = options.arrayFormat
  }

  return qs.stringify(value, opts)
}
