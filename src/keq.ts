import { Core } from './core'
import { Exception } from './exception/exception'
import { InvalidArgumentsExceptions } from './exception/invalid-arguments.exception'
import { isBlob } from './is/is-blob'
import { isFile } from './is/is-file'
import { isFormData } from './is/is-form-data'
import { isHeaders } from './is/is-headers'
import { isUrlSearchParams } from './is/is-url-search-params'
import { KeqFlowControl, KeqFlowControlMode, KeqFlowControlSignal } from './types/keq-flow-control.js'
import { KeqMiddleware } from './types/keq-middleware'
import { KeqBuildInOptions, KeqOptions, KeqOptionsWithFullResponse, KeqOptionsWithoutFullResponse } from './types/keq-options'
import { KeqQueryValue } from './types/keq-query-value.js'
import { KeqRequestBody } from './types/keq-request-body'
import { KeqResolveMethod } from './types/keq-resolve-with-mode.js'
import { KeqRetryDelay } from './types/keq-retry-delay'
import { KeqRetryOn } from './types/keq-retry-on'
import { ShorthandContentType } from './types/shorthand-content-type'
import { assignKeqRequestBody } from './util/assign-keq-request-body'
import { base64Encode } from './util/base64'
import { fixContentType } from './util/fix-content-type'
import { getUniqueCodeIdentifier } from './util/get-unique-code-identifier.js'


/**
 * @description Keq 扩展 API，人性化的常用的API
 */
export class Keq<T> extends Core<T> {
  use(...middlewares: KeqMiddleware[]): this {
    return this.prependMiddlewares(...middlewares)
  }


  option(key: 'resolveWithFullResponse', value?: true): Keq<Response>
  option<K extends keyof KeqBuildInOptions>(key: K, value?: KeqBuildInOptions[K]): this
  option(key: string, value?: any): this
  option(key: string, value: any = true): this | Keq<Response> {
    this.__options__[key] = value
    return this
  }

  options(opts: KeqOptionsWithoutFullResponse): this
  options(opts: KeqOptionsWithFullResponse): Keq<Response>
  options(opts: KeqOptions): this
  options(opts: KeqOptions): this | Keq<Response> {
    for (const [key, value] of Object.entries(opts)) {
      this.__options__[key] = value
    }
    return this
  }


  /**
   * Set request header
   *
   * @description 设置请求头
   */
  set(headers: Headers): this
  set(headers: Record<string, string>): this
  set(name: string, value: string): this
  set(headersOrName: string | Record<string, string> | Headers, value?: string): this {
    if (isHeaders(headersOrName)) {
      headersOrName.forEach((value, key) => {
        this.requestContext.headers.set(key, value)
      })
    } else if (typeof headersOrName === 'string' && value) {
      this.requestContext.headers.set(headersOrName, value)
    } else if (typeof headersOrName === 'object') {
      for (const [key, value] of Object.entries(headersOrName)) {
        this.requestContext.headers.set(key, value)
      }
    }
    return this
  }


  /**
   * Set request query/searchParams
   */
  query(key: Record<string, KeqQueryValue | KeqQueryValue[]>): this
  query(key: string, value: KeqQueryValue | KeqQueryValue[]): this
  query(key: string | Record<string, KeqQueryValue | KeqQueryValue[]>, value?: KeqQueryValue | KeqQueryValue[]): this {
    if (typeof key === 'object') {
      for (const [k, v] of Object.entries(key)) {
        if (v === undefined) continue
        this.query(k, v)
      }
      return this
    }

    if (typeof key === 'string') {
      if (Array.isArray(value)) {
        for (const item of value) {
          this.query(key, item)
        }
      } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
        this.requestContext.url.searchParams.append(key, String(value))
      } else if (value === 'undefined' || value === null) {
        // skip
      } else {
        console.warn(`query value type is invalid, key: ${key}`)
      }

      return this
    }

    throw new TypeError('typeof key is invalid')
  }

  /**
   * Set request route params
   */
  params(key: Record<string, string | number>): this
  params(key: string, value: string | number): this
  params(key: string | Record<string, string | number>, value?: string | number): this {
    if (typeof key === 'string') {
      this.requestContext.routeParams[key] = String(value)
    } else if (typeof key === 'object') {
      for (const [k, v] of Object.entries(key)) {
        this.requestContext.routeParams[k] = String(v)
      }
    } else {
      throw new Exception('please set params value')
    }

    return this
  }

  /**
   * Set request body
   */
  body(value: KeqRequestBody): this {
    this.requestContext.body = value
    return this
  }


  /**
   * Setting the Content-Type
   */
  type(contentType: ShorthandContentType | string): this {
    const type = fixContentType(contentType)
    this.set('Content-Type', type)
    return this
  }


  /**
   * Http Basic Authentication
   */
  auth(username: string, password: string): this {
    this.set('Authorization', `Basic ${base64Encode(`${username}:${password}`)}`)
    return this
  }

  private setTypeIfEmpty(contentType: ShorthandContentType | string): void {
    if (!this.requestContext.headers.has('Content-Type')) void this.type(contentType)
  }

  /**
   * set request body
   */
  send(value: FormData | URLSearchParams | object | Array<any> | string): this {
    this.requestContext.body = assignKeqRequestBody(this.requestContext.body, value)

    if (isUrlSearchParams(value)) {
      this.setTypeIfEmpty('form')
    } else if (isFormData(value)) {
      this.setTypeIfEmpty('form-data')
    } else if (typeof value === 'object') {
      this.setTypeIfEmpty('json')
    }

    return this
  }

  field(arg1: string, value: string | string[]): this
  field(arg1: Record<string, string>): this
  field(arg1: string | Record<string, string>, arg2?: any): this {
    if (typeof arg1 === 'object') {
      this.requestContext.body = assignKeqRequestBody(this.requestContext.body, arg1)
    } else if (arg2) {
      this.requestContext.body = assignKeqRequestBody(this.requestContext.body, { [arg1]: arg2 })
    } else {
      throw new InvalidArgumentsExceptions()
    }

    this.setTypeIfEmpty('form-data')
    return this
  }

  attach(key: string, value: Blob | File | Buffer): this
  attach(key: string, value: Blob | File | Buffer, filename: string): this
  attach(key: string, value: Blob | File | Buffer): this
  attach(key: string, value: Blob | File | Buffer, arg3 = 'file'): this {
    let file: File

    if (isBlob(value)) {
      const formData = new FormData()
      formData.set(key, value, arg3)
      file = formData.get(key) as File
    } else if (isFile(value)) {
      file = value
    } else if (value instanceof Buffer) {
      file = new File([value], arg3)
    } else {
      throw new InvalidArgumentsExceptions()
    }

    this.requestContext.body = assignKeqRequestBody(this.requestContext.body, { [key]: file })
    this.setTypeIfEmpty('form-dat')
    return this
  }

  /**
   *
   * @param retryTimes Max number of retries per call
   * @param retryDelay Initial value used to calculate the retry in milliseconds (This is still randomized following the randomization factor)
   * @param retryCallback Will be called after request failed
   */
  retry(retryTimes: number, retryDelay?: KeqRetryDelay, retryOn?: KeqRetryOn): Keq<T> {
    this.option('retryTimes', retryTimes)
    this.option('retryDelay', retryDelay)
    this.option('retryOn', retryOn)

    return this
  }


  redirect(mod: RequestRedirect): this {
    this.requestContext.redirect = mod
    return this
  }

  credentials(mod: RequestCredentials): this {
    this.requestContext.credentials = mod
    return this
  }

  mode(mod: RequestMode): this {
    this.requestContext.mode = mod
    return this
  }

  flowControl(mode: KeqFlowControlMode, signal?: KeqFlowControlSignal): this {
    const sig = signal ? signal : getUniqueCodeIdentifier(1)

    if (!sig) {
      throw new Exception('please set signal to .flowControl()')
    }

    const flowControl: KeqFlowControl = {
      mode,
      signal: sig,
    }

    this.option('flowControl', flowControl)
    return this
  }

  timeout(milliseconds: number): this {
    this.option('timeout', { millisecond: milliseconds })
    return this
  }

  resolveWith(m: 'response'): Keq<Response>
  resolveWith(m: 'array-buffer'): Keq<ArrayBuffer>
  resolveWith(m: 'blob'): Keq<Blob>
  resolveWith(m: 'text'): Keq<string>
  resolveWith<U = any>(m: 'json' | 'form-data'): Keq<U>
  resolveWith<U = any>(m: KeqResolveMethod): Keq<U> | Keq<string> | Keq<Blob> | Keq<ArrayBuffer> | Keq<Response> {
    this.option('resolveWith', m)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this as any
  }
}
