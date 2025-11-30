import { UriTemplateContext } from '@opendoc/uri-template'
import { shallowClone } from '~/utils/shallow-clone.js'
import { Validator } from '~/validator/index.js'
import { Exception } from '~/exception/exception.js'
import { KeqRequestMethod, KeqBodyInit } from './types/index.js'
import {
  toUrlSearchParams,
  toFormData,
  cloneBody,
  cloneHeaders,
  compileUrl,
} from './utils/index.js'

export interface KeqRequestInitOptions {
  url: URL
  routeParams: UriTemplateContext
  method: KeqRequestMethod
  headers: Headers
  body: KeqBodyInit
  cache?: RequestCache
  credentials?: RequestCredentials
  integrity?: string
  keepalive?: boolean
  mode?: RequestMode
  redirect?: RequestRedirect
  referrer?: string
  referrerPolicy?: ReferrerPolicy
}

export class KeqRequestInit {
  url: URL
  routeParams: UriTemplateContext

  method: KeqRequestMethod
  headers: Headers
  body: KeqBodyInit
  cache?: RequestCache
  credentials?: RequestCredentials
  integrity?: string
  keepalive?: boolean
  mode?: RequestMode
  redirect?: RequestRedirect
  referrer?: string
  referrerPolicy?: ReferrerPolicy

  private readonly __abortController__: AbortController = new AbortController()

  constructor(options: KeqRequestInitOptions) {
    this.url = new URL(options.url.href)
    this.routeParams = shallowClone(options.routeParams)
    this.method = options.method
    this.headers = cloneHeaders(options.headers)
    this.body = cloneBody(options.body)
    this.cache = options.cache
    this.credentials = options.credentials
    this.integrity = options.integrity
    this.keepalive = options.keepalive
    this.mode = options.mode
    this.redirect = options.redirect
    this.referrer = options.referrer
    this.referrerPolicy = options.referrerPolicy
  }

  // the url merged routeParams
  get __url__(): Readonly<URL> {
    return compileUrl(this.url, this.routeParams)
  }

  get signal(): AbortSignal {
    return this.__abortController__.signal
  }

  abort(reason: any): void {
    if (!this.__abortController__.signal.aborted) {
      this.__abortController__.abort(reason)
    }
  }

  clone(): KeqRequestInit {
    return new KeqRequestInit({
      url: this.url,
      routeParams: this.routeParams,
      method: this.method,
      headers: this.headers,
      body: this.body,
      cache: this.cache,
      credentials: this.credentials,
      integrity: this.integrity,
      keepalive: this.keepalive,
      mode: this.mode,
      redirect: this.redirect,
      referrer: this.referrer,
      referrerPolicy: this.referrerPolicy,
    })
  }


  private getContentType(): string | undefined {
    const contentType = this.headers.get('Content-Type')
    if (contentType) return contentType
    if (!this.body) return undefined

    if (Validator.isFormData(this.body)) return 'multipart/form-data'
    if (Validator.isUrlSearchParams(this.body)) return 'application/x-www-form-urlencoded'
    if (Validator.isArrayBuffer(this.body)) return 'application/octet-stream'
    if (typeof this.body === 'object') return 'application/json'

    return undefined
  }

  private toFetchBody(contentType: string | undefined): RequestInit['body'] {
    const body = this.body
    if (body === undefined) return
    if (body === null) return null
    if (Validator.isBodyInit(body)) return body

    if (!contentType || contentType === 'application/json') {
      return JSON.stringify(body)
    }

    if (contentType === 'application/x-www-form-urlencoded') {
      if (Array.isArray(body)) {
        throw new Exception('request.body is an array, that cannot be serialized as application/x-www-form-urlencoded format')
      }

      return toUrlSearchParams(body)
    }

    if (contentType === 'multipart/form-data') {
      if (Array.isArray(body)) {
        throw new Exception('FormData cannot send array')
      }

      return toFormData(body)
    }

    throw new Exception(`Cannot auto serialize request.body with Content-Type: ${contentType}`)
  }

  toFetchArguments(): [string, RequestInit] {
    const contentType = this.getContentType()
    const headers = cloneHeaders(this.headers)
    if (contentType) headers.set('Content-Type', contentType)

    const body = this.toFetchBody(contentType)
    if (contentType === 'multipart/form-data') {
      headers.delete('Content-Type')
    }

    const requestInit: RequestInit = {
      method: this.method.toUpperCase(),
      headers,
      body,
      cache: this.cache,
      credentials: this.credentials,
      integrity: this.integrity,
      keepalive: this.keepalive,
      mode: this.mode,
      redirect: this.redirect,
      referrer: this.referrer,
      referrerPolicy: this.referrerPolicy,
      signal: this.signal,
    }

    return [this.__url__.href, requestInit]
  }
}
