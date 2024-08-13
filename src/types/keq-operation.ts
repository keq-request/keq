/* eslint-disable @typescript-eslint/ban-types */
import { ExtractProperty } from './extract-property.js'
import { KeqContextRequestMethod } from './keq-context-request.js'

export interface KeqOperation {

  requestParams: {
    [key: string]: string | number
  }

  requestQuery: {
    [key: string]: string | string[] | number
  }

  requestHeaders: {
    [key: string]: string | number
  }

  requestBody: FormData | URLSearchParams | object | Array<any> | string

  responseBody: any
}

export type ExtractHeaders<T extends Pick<KeqOperation, 'requestHeaders'>> = ExtractProperty<T['requestHeaders'], string>
export type ExtractQuery<T extends Pick<KeqOperation, 'requestQuery'>> = ExtractProperty<T['requestQuery'], string | string[]>
export type ExtractParams<T extends Pick<KeqOperation, 'requestParams'>> = ExtractProperty<T['requestParams'], string>
export type ExtractFields<T extends Pick<KeqOperation, 'requestBody'>> = ExtractProperty<Exclude<Extract<T['requestBody'], object>, FormData | URLSearchParams | Array<any>>, string>
export type ExtractFiles<T extends Pick<KeqOperation, 'requestBody'>> = ExtractProperty<Exclude<Extract<T['requestBody'], object>, FormData | URLSearchParams | Array<any>>, Buffer | Blob | File>


export type KeqOperations = {
  [url: string]: {
    [method in KeqContextRequestMethod]?: KeqOperation
  }
}


export type FlattenOperations<T extends KeqOperations, M extends KeqContextRequestMethod> = {
  [P in keyof T as T[P][M] extends KeqOperation ? P : never ]: T[P][M] extends KeqOperation ? T[P][M] : never
}


export interface KeqBaseOperation extends KeqOperation {
  url: string
  method: KeqContextRequestMethod
  output: any

  requestParams: {
    [key: string]: string
  }

  requestQuery: {
    [key: string]: string | string[]
  }

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
