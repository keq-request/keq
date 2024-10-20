import { Exception } from '../exception/exception.js'
import { ABORT_PROPERTY } from '../constant.js'
import { isBuffer } from '~/is/is-buffer.js'

import type { KeqContext } from '~/types/keq-context.js'
import type { KeqMiddleware } from '../types/keq-middleware.js'
import type { KeqContextRequestBody } from '~/types/keq-context-request.js'


function inferContentTypeByBody(body: KeqContextRequestBody): string {
  if (!body) return 'text/plain'
  if (typeof body === 'object') return 'application/json'
  return 'application/x-www-form-urlencoded'
}

function compileBody(ctx: KeqContext): RequestInit['body'] {
  const request = ctx.request
  const body = request.body

  const contentType = request.headers.get('Content-Type')

  if (contentType === 'application/json' && body) {
    return typeof body === 'object' ? JSON.stringify(body) : body
  } else if (contentType === 'application/x-www-form-urlencoded' && body) {
    if (Array.isArray(body)) return

    const params = new URLSearchParams()
    Object.entries(body).map(([key, value]) => {
      if (Array.isArray(value)) {
        for (const v of value) {
          params.append(key, v)
        }
      } else {
        params.append(key, value)
      }
    })
    return params
  } else if (contentType === 'multipart/form-data') {
    if (Array.isArray(ctx.request.body)) {
      throw new Exception('FormData cannot send array')
    }

    if (!ctx.request.body) return

    const body = ctx.request.body
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

    request.headers.delete('content-type')
    return form
  }

  if (isBuffer(body)) return body
  if (body === undefined) return body
  if (body === null) return 'null'
  if (typeof body === 'string') return body
  if (typeof body === 'number') return String(body)
}


export function fetchArgumentsMiddleware(): KeqMiddleware {
  return async function fetchArgumentsMiddleware(ctx, next) {
    const request = ctx.request
    const url = ctx.request.__url__.href

    if (!request.headers.has('Content-Type') && request.body) {
      request.headers.set('Content-Type', inferContentTypeByBody(ctx.request.body))
    }

    const abortController = new AbortController()
    ctx[ABORT_PROPERTY] = abortController

    const requestInit: RequestInit = {
      method: request.method.toUpperCase(),
      headers: request.headers,
      body: compileBody(ctx),
      cache: request.cache,
      credentials: request.credentials,
      integrity: request.integrity,
      keepalive: request.keepalive,
      mode: request.mode,
      redirect: request.redirect,
      referrer: request.referrer,
      referrerPolicy: request.referrerPolicy,
      signal: abortController.signal,
    }

    ctx.fetchArguments = [url, requestInit]

    await next()
  }
}
