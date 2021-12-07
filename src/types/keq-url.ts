import { UrlWithParsedQuery } from 'url'


export interface KeqURL extends UrlWithParsedQuery {
  params: Record<string, string | number>
}

