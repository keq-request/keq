import qs, { IStringifyOptions } from 'qs'
import { KeqQueryOptions, KeqQueryValue } from '../types'

function normalize(value: KeqQueryValue, options?: KeqQueryOptions): KeqQueryValue {
  if (Array.isArray(value)) {
    if (options?.arrayFormat === 'pipe') {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return value.join('|')
    }

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

export function queryStringify(query: KeqQueryValue, options?: KeqQueryOptions): string {
  const value = normalize(query, options)

  const opts: IStringifyOptions = {
    encode: false,
  }

  if (options?.allowDots !== undefined) {
    opts.allowDots = options.allowDots
    // if (options.encodeDotInKeys !== undefined) {
    //   opts.encodeDotInKeys = options.encodeDotInKeys as any
    // }
  }

  if (options?.indices !== undefined) {
    opts.indices = options.indices
  }

  if (options?.arrayFormat && options.arrayFormat !== 'pipe') {
    opts.arrayFormat = options.arrayFormat
  }

  return qs.stringify(value, opts)
}
