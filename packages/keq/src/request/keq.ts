
/* eslint-disable @typescript-eslint/no-explicit-any */
import qs from 'qs'
import { Core } from './core.js'
import { Exception, TypeException } from '~/exception/index.js'
import { Validator } from '~/validator/index.js'
import { KeqFlowControlOptions, KeqFlowControlMode, KeqFlowControlSignal } from '~/middlewares/index.js'
import { mergeKeqRequestBody, fixContentType } from './utils/index.js'
import { base64Encode } from '~/utils/index.js'
import { KeqRequestBody } from '~/request-init/index.js'

import type { KeqRetryOn, KeqRetryDelay, KeqResolveWithMode } from '~/context/index.js'
import type { KeqQueryValue, CommonContentType, ShorthandContentType, KeqDefaultOperation, KeqOperation, KeqAttachableFile } from './types/index.js'
import type { ConditionalPick, Merge, Primitive } from 'type-fest'
import { LiteralKeys } from '~/types/literal-keys.js'


/**
 * extends Core to provide a fluent API for building HTTP requests
 */
export class Keq<
  OP extends KeqOperation = KeqDefaultOperation,
  RES_BODY extends KeqOperation['responseBody'] = OP['responseBody'],
  REQ_PARAMS extends KeqOperation['requestParams'] = OP['requestParams'],
  REQ_QUERY extends KeqOperation['requestQuery'] = OP['requestQuery'],
  REQ_HEADERS extends KeqOperation['requestHeaders'] = OP['requestHeaders'],
  REQ_BODY extends KeqOperation['requestBody'] = OP['requestBody'],
> extends Core<OP> {
  /**
   * Set request header
   *
   * @description 设置请求头
   */
  set(headers: Partial<REQ_HEADERS>): this
  set(headers: Headers): this
  set<T extends keyof LiteralKeys<REQ_HEADERS>>(name: T, value: LiteralKeys<REQ_HEADERS>[T]): this
  set<T extends keyof REQ_HEADERS>(name: T, value: REQ_HEADERS[T]): this
  set(headersOrName: Partial<REQ_HEADERS> | string | Headers, value?: string | number): this {
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
          throw new Exception(`[Invalid header] Key: ${key} Value: ${String(value)}`)
        }

        this.requestInit.headers.set(key, String(value))
      }
    }
    return this
  }


  /**
   * Set request query/searchParams
   */
  query(key: Partial<REQ_QUERY>): this
  query<T extends keyof LiteralKeys<REQ_QUERY>>(key: T, value: LiteralKeys<REQ_QUERY>[T]): this
  query<T extends keyof REQ_QUERY>(key: T, value: REQ_QUERY[T]): this
  query(key: string | Partial<REQ_QUERY>, value?: KeqQueryValue): this {
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
      this.query({ [key]: value } as Partial<REQ_QUERY>)
      return this
    }

    throw new TypeException('Invalid Arguments for .query()')
  }

  /**
   * Set request route params
   */
  params(key: Partial<REQ_PARAMS>): this
  params<T extends keyof LiteralKeys<REQ_PARAMS>>(key: T, value: LiteralKeys<REQ_PARAMS>[T]): this
  params<T extends keyof REQ_PARAMS>(key: T, value: REQ_PARAMS[T]): this
  params(key: string | Partial<REQ_PARAMS>, value?: string | number): this {
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
    this.set('content-type' as keyof REQ_HEADERS, type as any)
    return this
  }


  /**
   * Http Basic Authentication
   */
  auth(username: string, password: string): this {
    this.set('Authorization' as keyof REQ_HEADERS, `Basic ${base64Encode(`${username}:${password}`)}` as any)
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
  send(value: REQ_BODY): this {
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


  field<T extends ConditionalPick<RES_BODY, Primitive>, K extends keyof T>(arg1: K, value: T[K]): this
  field(arg1: ConditionalPick<RES_BODY, Primitive>): this
  field(arg1: string, value: string | string[]): this
  field(arg1: Record<string, string>): this
  field(arg1: string | Record<string, string>, arg2?: any): this {
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


  attach<T extends keyof ConditionalPick<REQ_BODY, KeqAttachableFile>>(key: T, value: KeqAttachableFile, filename: string): this
  attach<T extends keyof ConditionalPick<REQ_BODY, KeqAttachableFile>>(key: T, value: KeqAttachableFile | KeqAttachableFile[]): this
  attach(key: string, value: KeqAttachableFile, filename: string): this
  attach(key: string, value: KeqAttachableFile | KeqAttachableFile[]): this
  attach(key: string, value: KeqAttachableFile | KeqAttachableFile[], arg3 = 'file'): this {
    const formData = new FormData()

    const appendFile = (file: KeqAttachableFile): void => {
      if (Validator.isBlob(file)) {
        formData.append(key, file, arg3)
      } else if (Validator.isFile(file)) {
        formData.append(key, file)
      } else if (Validator.isBuffer(file)) {
        formData.append(key, new Blob([file as any]), arg3)
      } else {
        throw new TypeException('Invalid file type for .attach()')
      }
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        throw new TypeException('Empty array provided to .attach() is not valid')
      }

      for (const item of value) {
        appendFile(item)
      }
    } else {
      appendFile(value)
    }

    const files = formData.getAll(key)

    this.requestInit.body = mergeKeqRequestBody(
      this.requestInit.body,
      {
        [key]: files.length === 1 ? files[0] : files,
      },
    )

    this.setTypeIfEmpty('form-data')
    return this
  }

  /**
   *
   * @param retryTimes Max number of retries per call
   * @param retryDelay Initial value used to calculate the retry in milliseconds (This is still randomized following the randomization factor)
   * @param retryCallback Will be called after request failed
   */
  retry(retryTimes: number, retryDelay: KeqRetryDelay = 0, retryOn: KeqRetryOn = (attempt, error) => !!error): this {
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

  resolveWith(m: 'response'): Keq<Merge<OP, { responseBody: Response }>>
  resolveWith(m: 'array-buffer'): Keq<Merge<OP, { responseBody: ArrayBuffer }>>
  resolveWith(m: 'blob'): Keq<Merge<OP, { responseBody: Blob }>>
  resolveWith(m: 'text'): Keq<Merge<OP, { responseBody: string }>>
  resolveWith<T = any>(m: 'json' | 'form-data'): Keq<Merge<OP, { responseBody: T }>>
  resolveWith<T = any>(m: KeqResolveWithMode): Keq<Merge<OP, { responseBody: T }>> | Keq<Merge<OP, { responseBody: string }>> | Keq<Merge<OP, { responseBody: Blob }>> | Keq<Merge<OP, { responseBody: ArrayBuffer }>> | Keq<Merge<OP, { responseBody: Response }>> {
    this.option('resolveWith', m)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this as any
  }
}
