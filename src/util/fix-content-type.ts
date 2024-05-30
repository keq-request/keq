import { ShorthandContentType } from '~/types/content-type.js'


export function fixContentType(contentType: ShorthandContentType): string
export function fixContentType(contentType: string): string
export function fixContentType(contentType: string): string {
  if (['json', 'xml'].includes(contentType)) {
    return `application/${contentType}`
  } else if (['html', 'css'].includes(contentType)) {
    return `text/${contentType}`
  } else if (['form-data'].includes(contentType)) {
    return `multipart/${contentType}`
  } else if (['jpeg', 'bmp', 'apng', 'gif', 'x-icon', 'png', 'webp', 'tiff'].includes(contentType)) {
    return `image/${contentType}`
  } else if (contentType === 'form') {
    return 'application/x-www-form-urlencoded'
  } else if (contentType === 'svg') {
    return 'image/svg+xml'
  }
  return contentType
}
