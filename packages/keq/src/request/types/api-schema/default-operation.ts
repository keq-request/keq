import { KeqOperation } from './operation'
import { KeqQueryObject } from '../keq-query-value'
import { Merge, Simplify } from 'type-fest'


export interface DefaultOperation extends KeqOperation {
  requestParams: { [key: string]: string }
  requestQuery: Simplify<KeqQueryObject>

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
  }

  requestBody: FormData | URLSearchParams | object | Array<any> | string

  responseBody: unknown
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type KeqDefaultOperation<T extends Partial<KeqOperation> = {}> = Merge<DefaultOperation, T>
