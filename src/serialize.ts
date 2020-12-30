import { Context } from './context'
import { FormData } from './polyfill'


export type SerializeBodyFn = (value: KeqBody, ctx: Context) => any
export type KeqBody = Record<string, any> | any[] | undefined

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

export function serializeBodyByMap(map: SerializeMap): SerializeBodyFn {
  return function innerSerializeBodyFn(value: KeqBody, ctx: Context): any {
    const contentType = ctx.request.headers.get('content-type')
    if (!contentType) return value

    const type = Object.keys(map).find(item => contentType.includes(item))
    if (!type) return value
    else return serializeMap[type](value)
  }
}
