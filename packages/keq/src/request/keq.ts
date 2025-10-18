/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import qs from 'qs'
import { Core } from './core.js'
import { Exception, TypeException } from '~/exception/index.js'
import { Validator } from '~/validator/index.js'
import { KeqFlowControlOptions, KeqFlowControlMode, KeqFlowControlSignal } from '~/middlewares/index.js'
import { mergeKeqRequestBody, fixContentType } from './utils/index.js'
import { base64Encode } from '~/utils/index.js'
import { KeqRequestBody } from '~/request-init/index.js'

import type { KeqMiddleware } from '~/middleware/index.js'
import type { KeqRetryOn, KeqRetryDelay, KeqOptionsParameter, KeqOptionsReturnType, KeqResolveWithMode, KeqContextOptions } from '~/context/index.js'
import type { KeqQueryObject, KeqQueryValue, CommonContentType, ShorthandContentType, ExtractFields, ExtractFiles, KeqBaseOperation, KeqOperation } from './types/index.js'


/**
 * @description Keq 扩展 API，人性化的常用的API
 */
export class Keq<
  OUTPUT,
  OPERATION extends Omit<KeqOperation, 'responseBody'> = KeqBaseOperation,
> extends Core<OUTPUT> {
  use(...middlewares: KeqMiddleware[]): this {
    return this.prependMiddlewares(...middlewares)
  }


  option<K extends keyof KeqOptionsReturnType<OUTPUT>>(key: K, value?: KeqOptionsParameter[K]): KeqOptionsReturnType<OUTPUT>[K]
  option(key: string, value?: any): this
  option(key: string, value: any = true): Keq<any> {
    this.__options__[key] = value
    return this
  }

  options(opts: KeqContextOptions): this {
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
  set<K extends 'strict'>(headers: OPERATION['requestHeaders']): this
  set<K extends 'strict', T extends keyof OPERATION['requestHeaders']>(name: T, value: OPERATION['requestHeaders'][T]): this
  set<T extends keyof KeqBaseOperation['requestHeaders']>(name: T, value: KeqBaseOperation['requestHeaders'][T]): this
  set(headers: Headers): this
  set(headers: Record<string, string>): this
  set(name: string, value: string | number): this
  set(
    headersOrName: OPERATION['requestHeaders'] | KeqOperation['requestHeaders'] | string | Record<string, string> | Headers,
    value?: string | number,
  ): this {
    if (Validator.isHeaders(headersOrName)) {
      headersOrName.forEach((value, key) => {
        this.requestInit.headers.set(key, value)
      })
    } else if (typeof headersOrName === 'string' && value) {
      if (!Validator.isHeaderValue(value)) {
        throw new Exception(`[Invalid header] Key: ${headersOrName} Value: ${value}`)
      }

      this.requestInit.headers.set(headersOrName, String(value))
    } else if (typeof headersOrName === 'object') {
      for (const [key, value] of Object.entries(headersOrName)) {
        if (!Validator.isHeaderValue(value)) {
          throw new Exception(`[Invalid header] Key: ${key} Value: ${value}`)
        }

        this.requestInit.headers.set(key, String(value))
      }
    }
    return this
  }


  /**
   * Set request query/searchParams
   */
  query<K extends 'strict'>(key: OPERATION['requestQuery']): this
  query<K extends 'strict', T extends keyof OPERATION['requestQuery']>(key: T, value: OPERATION['requestQuery'][T]): this
  query(key: KeqQueryObject): this
  query(key: string, value: KeqQueryValue): this
  query(key: string | OPERATION['requestQuery'] | KeqQueryObject, value?: KeqQueryValue): this {
    if (Validator.isObject(key)) {
      const obj = qs.parse(
        qs.stringify(key, { encode: false, arrayFormat: 'brackets' }),
        { depth: 0 },
      ) as Record<string, string>

      for (const [k, v] of Object.entries(obj)) {
        for (const item of Array.isArray(v) ? v : [v]) {
          this.requestInit.url.searchParams.append(k, item)
        }
      }

      return this
    }

    if (typeof key === 'string') {
      this.query({ [key]: value })
      return this
    }

    throw new TypeError('typeof key is invalid')
  }

  /**
   * Set request route params
   */
  params<K extends 'strict'>(key: OPERATION['requestParams']): this
  params<K extends 'strict', T extends keyof OPERATION['requestParams']>(key: T, value: OPERATION['requestParams'][T]): this
  params(key: Record<string, string | number>): this
  params(key: string, value: string | number): this
  params(key: string | OPERATION['requestParams'] | Record<string, string | number>, value?: string | number): this {
    if (typeof key === 'string') {
      this.requestInit.routeParams[key] = String(value)
    } else if (typeof key === 'object') {
      for (const [k, v] of Object.entries(key)) {
        this.requestInit.routeParams[k] = String(v)
      }
    } else {
      throw new TypeError('Invalid Arguments for .params()')
    }

    return this
  }

  /**
   * Set request body
   */
  body(value: KeqRequestBody): this {
    this.requestInit.body = value
    return this
  }


  /**
   * Setting the Content-Type
   */
  type(contentType: ShorthandContentType): this
  type(contentType: CommonContentType): this
  type(contentType: string): this
  type(contentType: string): this {
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

  private setTypeIfEmpty(contentType: ShorthandContentType): void
  private setTypeIfEmpty(contentType: CommonContentType): void
  private setTypeIfEmpty(contentType: string): void
  private setTypeIfEmpty(contentType: string): void {
    if (!this.requestInit.headers.has('Content-Type')) void this.type(contentType)
  }

  /**
   * set request body
   */
  send<K extends 'strict'>(value: OPERATION['requestBody']): this
  send(value: object): this
  send(value: FormData): this
  send(value: URLSearchParams): this
  send(value: Array<any>): this
  send(value: string): this
  send(value: KeqRequestBody): this {
    this.requestInit.body = mergeKeqRequestBody(this.requestInit.body, value)

    if (Validator.isUrlSearchParams(value)) {
      this.setTypeIfEmpty('form')
    } else if (Validator.isFormData(value)) {
      this.setTypeIfEmpty('form-data')
    } else if (Validator.isBlob(value) || Validator.isReadableStream(value) || Validator.isArrayBuffer(value)) {
      // don't set content-type
    } else if (typeof value === 'object') {
      this.setTypeIfEmpty('json')
    }

    return this
  }


  field<T extends keyof ExtractFields<OPERATION>>(arg1: T, value: ExtractFields<OPERATION>[T]): this
  field(arg1: ExtractFields<OPERATION>): this
  field(arg1: string, value: string | string[]): this
  field(arg1: Record<string, string>): this
  field(arg1: ExtractFields<OPERATION> | string | Record<string, string>, arg2?: any): this {
    if (typeof arg1 === 'object') {
      this.requestInit.body = mergeKeqRequestBody(this.requestInit.body, arg1)
    } else if (arg2) {
      this.requestInit.body = mergeKeqRequestBody(this.requestInit.body, { [arg1]: arg2 })
    } else {
      throw new TypeException('Invalid arguments for .field()')
    }

    this.setTypeIfEmpty('form-data')
    return this
  }


  attach<T extends keyof ExtractFiles<OPERATION>>(key: T, value: Blob | File | Buffer, filename: string): this
  attach<T extends keyof ExtractFiles<OPERATION>>(key: T, value: Blob | File | Buffer): this
  attach(key: string, value: Blob | File | Buffer, filename: string): this
  attach(key: string, value: Blob | File | Buffer): this
  attach(key: string, value: Blob | File | Buffer, arg3 = 'file'): this {
    let file: File

    if (Validator.isBlob(value)) {
      const formData = new FormData()
      formData.set(key, value, arg3)
      file = formData.get(key) as File
    } else if (Validator.isFile(value)) {
      file = value
    } else if (Validator.isBuffer(value)) {
      const formData = new FormData()
      formData.set(key, new Blob([value as any]), arg3)
      file = formData.get(key) as File
    } else {
      throw new TypeException('Invalid file type for .attach()')
    }

    this.requestInit.body = mergeKeqRequestBody(this.requestInit.body, { [key]: file })
    this.setTypeIfEmpty('form-data')
    return this
  }

  /**
   *
   * @param retryTimes Max number of retries per call
   * @param retryDelay Initial value used to calculate the retry in milliseconds (This is still randomized following the randomization factor)
   * @param retryCallback Will be called after request failed
   */
  retry(retryTimes: number, retryDelay: KeqRetryDelay = 0, retryOn: KeqRetryOn = (attempt, error) => !!error): Keq<OUTPUT> {
    this.option('retry', {
      times: retryTimes,
      delay: retryDelay,
      on: retryOn,
    })

    return this
  }


  redirect(mod: RequestRedirect): this {
    this.requestInit.redirect = mod
    return this
  }

  credentials(mod: RequestCredentials): this {
    this.requestInit.credentials = mod
    return this
  }

  mode(mod: RequestMode): this {
    this.requestInit.mode = mod
    return this
  }

  flowControl(mode: KeqFlowControlMode, signal?: KeqFlowControlSignal): this {
    const sig = signal ? signal : this.__locationId__

    if (!sig) {
      throw new Exception('please set signal to .flowControl()')
    }

    const flowControl: KeqFlowControlOptions = {
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
  resolveWith<U = any>(m: KeqResolveWithMode): Keq<U> | Keq<string> | Keq<Blob> | Keq<ArrayBuffer> | Keq<Response> {
    this.option('resolveWith', m)

    return this as any
  }
}
