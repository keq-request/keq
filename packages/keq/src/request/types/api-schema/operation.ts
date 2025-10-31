import { KeqQueryValue } from '../keq-query-value'


export interface KeqOperation {
  requestParams: {
    [key: string]: string | number
  }

  requestQuery: {
    [key: string]: KeqQueryValue
  }

  requestHeaders: {
    [key: string]: string | number
  }

  requestBody: FormData | URLSearchParams | object | Array<any> | string

  responseBody: any
}
