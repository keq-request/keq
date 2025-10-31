import { KeqOperation } from './operation'
import { KeqQueryValue } from '../keq-query-value'
import { Merge } from 'type-fest'


export interface DefaultOperation extends KeqOperation {
  requestParams: {
    [key: string]: string
  }

  requestQuery: {
    [key: string]: KeqQueryValue
  }

  requestHeaders: {
    // Content negotiation
    'content-type': string
    accept: string
    'accept-language': string

    // Authentication & Authorization
    authorization: string

    // Caching
    'cache-control': string
    'if-modified-since': string
    'if-none-match': string

    // Request metadata
    referer: string

    [key: string]: string | number
  }

  requestBody: FormData | URLSearchParams | object | Array<any> | string

  responseBody: unknown
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type KeqDefaultOperation<T extends Partial<KeqOperation> = {}> = Merge<DefaultOperation, T>
