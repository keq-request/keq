import { UriTemplateContext, UriTemplateParser } from '@opendoc/uri-template'


export function compileUrl(obj: string | URL, routeParams: UriTemplateContext): URL {
  const url = new URL(typeof obj === 'string' ? obj : obj.href)

  url.pathname = new UriTemplateParser(
    decodeURIComponent(url.pathname),
    routeParams,
  ).expand()

  return url
}
