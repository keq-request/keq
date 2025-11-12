import { UriTemplateContext } from '@opendoc/uri-template'
import { KeqQueryValue } from '../keq-query-value'


export interface KeqOperation {
  requestParams: {
    [key in string]: UriTemplateContext[string]
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
