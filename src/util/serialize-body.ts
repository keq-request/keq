import { KeqBody, SerializeBodyFn } from '@/types'
import { FormData } from '@/polyfill'


export interface SerializeMap {
  [key: string]: (body: KeqBody) => any
}

export const serializeMap: SerializeMap = {
  'application/json': body => body ? JSON.stringify(body) : body,

  'multipart/form-data': body => {
    if (!body) return
    if (Array.isArray(body)) throw new Error('FormData cannot send array')
    const form = new FormData()

    Object.entries(body).map(([key, value]) => {
      if (Array.isArray(value)) {
        for (const v of value) {
          form.append(key, v)
        }
      } else {
        form.append(key, value)
      }
    })

    /**
     * Compatible with node-fetch@2.x
     */
    return form['stream'] || form
  },

  'application/x-www-form-urlencoded': body => {
    if (!body) return
    if (Array.isArray(body)) return

    const form = new URLSearchParams()
    Object.entries(body as Record<string, any>).map(([key, value]) => {
      if (Array.isArray(value)) {
        for (const v of value) {
          form.append(key, v)
        }
      } else {
        form.append(key, value)
      }
    })
    return form
  },
}


export const serializeBody: SerializeBodyFn = (body, ctx) => {
  const contentType = ctx.request.headers.get('content-type')

  if (!contentType) return body

  const type = Object.keys(serializeMap).find(item => contentType.includes(item))
  if (!type) return body
  else return serializeMap[type](body)
}

