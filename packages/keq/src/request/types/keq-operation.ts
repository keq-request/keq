/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeqRequestMethod } from '~/request-init/index.js'
import { KeqQueryObject } from './keq-query-value.js'
import { ConditionalPick } from 'type-fest'

export interface KeqOperation {

  requestParams: {
    [key: string]: string | number
  }

  requestQuery: KeqQueryObject

  requestHeaders: {
    [key: string]: string | number
  }

  requestBody: FormData | URLSearchParams | object | Array<any> | string

  responseBody: any
}

export type ExtractFields<T extends Pick<KeqOperation, 'requestBody'>> = ConditionalPick<Exclude<Extract<T['requestBody'], object>, FormData | URLSearchParams | Array<any>>, string>
export type ExtractFiles<T extends Pick<KeqOperation, 'requestBody'>> = ConditionalPick<Exclude<Extract<T['requestBody'], object>, FormData | URLSearchParams | Array<any>>, Buffer | Blob | File>


export interface KeqOperations {
  [url: string]: {
    [method in KeqRequestMethod]?: KeqOperation
  }
}


export type FlattenOperations<T extends KeqOperations, M extends KeqRequestMethod> = {
  [P in keyof T as T[P][M] extends KeqOperation ? P : never ]: T[P][M] extends KeqOperation ? T[P][M] : never
}


export interface KeqBaseOperation extends KeqOperation {
  url: string
  method: KeqRequestMethod
  output: any

  requestParams: {
    [key: string]: string
  }

  requestQuery: KeqQueryObject

  requestHeaders: {
    'content-type': string
    cookie: string
    host: string
    authorization: string
    'cache-control': string
    'content-encoding': string
    referer: string
    'user-agent': string
  }

  requestBody: FormData | URLSearchParams | object | Array<any> | string
}
