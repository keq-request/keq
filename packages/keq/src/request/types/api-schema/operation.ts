import { KeqQueryInit } from '../keq-query-value'
import { KeqPathParameterInit } from '../keq-param-value'
import { KeqBodyInit } from '~/request-init'


export interface KeqOperation {
  requestParams: {
    [key in string]: KeqPathParameterInit
  }

  requestQuery: {
    [key in string]: KeqQueryInit
  }

  requestHeaders: {
    [key in string]: string | number
  }

  requestBody: KeqBodyInit

  responseBody: any
}
