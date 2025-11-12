import { IStringifyBaseOptions } from 'qs'

// interface KeqQueryBaseOptions {
//   indices?: IStringifyBaseOptions['indices']
//   arrayFormat?: IStringifyBaseOptions['arrayFormat'] | 'pipe'
// }

// export type KeqQueryOptions = (KeqQueryBaseOptions & { allowDots: true; encodeDotInKeys?: boolean })
//   | (KeqQueryBaseOptions & { allowDots?: false; encodeDotInKeys?: false })

export interface KeqQueryOptions {
  indices?: IStringifyBaseOptions['indices']
  arrayFormat?: IStringifyBaseOptions['arrayFormat'] | 'pipe' | 'space'
  allowDots?: boolean
}
