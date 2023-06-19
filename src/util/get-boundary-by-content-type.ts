import { Exception } from '~/exception'


export function getBoundaryByContentType(contentType: string): string {
  const multipart = /multipart/i.test(contentType)

  if (!multipart) throw new Exception(`Cannot parse form-data body with content-type: ${contentType}`)

  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType)
  if (!m) throw new Exception('bad content-type header, no multipart boundary')
  return m[1] || m[2]
}
