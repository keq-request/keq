import { compile } from 'path-to-regexp'
import { URL } from 'whatwg-url'
import { Exception } from '~/exception/exception'
import { KeqContext } from '~/types/keq-context'
import { KeqRequestBody } from '~/types/keq-request-body'
import { KeqMiddleware } from '../types/keq-middleware'


function compileUrl(obj: string | URL | globalThis.URL, routeParams: Record<string, string>): string {
  const url = new URL(typeof obj === 'string' ? obj : obj.href)

  try {
    const toPath = compile(url.pathname, { encode: encodeURIComponent })
    url.pathname = toPath(routeParams)
  } catch (e) {
    throw new Exception(`Cannot compile the params in ${url.pathname}, Because ${(e as Error)?.message}.`)
  }

  return url.href
}

function inferContentTypeByBody(body: KeqRequestBody): string {
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
}


export function fetchArgumentsMiddleware(): KeqMiddleware {
  return async (ctx, next) => {
    const request = ctx.request
    const url = compileUrl(request.url, request.routeParams)


    if (!request.headers.has('Content-Type') && request.body) {
      request.headers.set('Content-Type', inferContentTypeByBody(ctx.request.body))
    }

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
      signal: request.signal,
    }

    ctx.fetchArguments = [url, requestInit]

    await next()
  }
}
