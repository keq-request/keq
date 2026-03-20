/* eslint-disable @typescript-eslint/no-empty-object-type */
import { KeqOperation } from './operation'
import { Override } from '~/types'


export interface DefaultOperation extends KeqOperation {
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

  responseBody: unknown
}


export type KeqDefaultOperation<T extends Partial<KeqOperation> = {}> = Override<DefaultOperation, T>
