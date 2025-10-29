import { Simplify } from 'type-fest'
import { KeqQueryObject } from '../keq-query-value'


export interface KeqOperation {
  requestParams: {
    [key: string]: string | number
  }

  requestQuery: Simplify<KeqQueryObject>

  requestHeaders: {
    [key: string]: string | number
  }

  requestBody: FormData | URLSearchParams | object | Array<any> | string

  responseBody: any
}
