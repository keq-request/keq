/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { FormData } from '~/polyfill'
import { Context, KeqBody, SerializeBodyFn } from '~/types'
import { isBrowser } from './is'


export interface SerializeMap {
  [key: string]: (body: KeqBody, ctx: Context) => any
}

export const serializeMap: SerializeMap = {
  'application/json': body => body ? JSON.stringify(body) : body,

  'multipart/form-data': (body, ctx) => {
    if (!body) return
    if (Array.isArray(body)) throw new Error('FormData cannot send array')
    const form = new FormData()

    for (const [key, value] of Object.entries(body)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          form.append(key, v)
        }
      } else {
        form.append(key, value)
      }
    }

    if (isBrowser) {
      ctx.headers.delete('content-type')
      return form
    } else {
      const FormDataEncoder = require('form-data-encoder').FormDataEncoder
      const encoder = new FormDataEncoder(form as any)
      ctx.headers.set('content-type', encoder.headers['Content-Type'])
      ctx.headers.set('content-length', encoder.headers['Content-Length'])

      return require('stream').Readable.from(encoder)
    }

    /**
     * Compatible with node-fetch@2.x
     */
    // return form['stream'] || form
  },

  'application/x-www-form-urlencoded': body => {
    if (!body) return
    if (Array.isArray(body)) return

    const form = new URLSearchParams()
    Object.entries(body).map(([key, value]) => {
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
  else return serializeMap[type](body, ctx)
}

