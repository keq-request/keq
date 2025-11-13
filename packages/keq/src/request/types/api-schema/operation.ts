import { KeqQueryValue } from '../keq-query-value'
import { KeqParamValue } from '../keq-param-value'


export interface KeqOperation {
  requestParams: {
    [key in string]: KeqParamValue
  }

  requestQuery: {
    [key in string]: KeqQueryValue
  }

  requestHeaders: {
    [key in string]: string | number
  }

  requestBody: FormData | URLSearchParams | object | Array<any> | string

  responseBody: any
}
