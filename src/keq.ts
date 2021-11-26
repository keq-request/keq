import * as url from 'url'
import fetch, { Headers } from 'cross-fetch'
import * as clone from 'clone'
import { Middleware, MiddlewareMatcher, matchHost, matchMiddleware, compose } from './middleware'
import { Context, RequestContext, Options, RequestMethod, BuildInOptions, OptionsWithFullResponse, OptionsWithoutFullResponse, KeqURL } from './context'
import { SerializeBodyFn, serializeBodyByMap, serializeMap, KeqBody } from './serialize'
import { encodeBase64 } from './base64'
import { messages } from './const'
import { FormData } from './polyfill'
import { isFormData, isFile, isBrowser } from './utils'
import { FormDataFieldOptions } from './form-data-fields'
import { fixType, ShorthandContentType } from './fix-type'
import { getTypeByBody } from './get-type-by-body'
import { Stream } from 'stream'
import { getBoundaryByContentType, parseFormData } from './parse-form-data'
import { compile } from 'path-to-regexp'
import * as R from 'ramda'
import { sleep } from './sleep'


type RetryCallback = (error: Error) => void

export class Keq<T> {
  private requestPromise?: Promise<T>

  private urlObj: KeqURL
  private method: RequestMethod
  private headers: Headers = new Headers()
  private middlewares: Middleware[] = []
  private opts: Options = { resolveWithFullResponse: false, resolveWithOriginalResponse: false }
  private body: KeqBody
  private serializeBodyFn: SerializeBodyFn = serializeBodyByMap(serializeMap)
  private retryTimes = 0
  private initialRetryTime = 0
  private retryCallback?: RetryCallback

  public constructor(urlObj: KeqURL, method: RequestMethod, middlewares: Middleware[]) {
    this.urlObj = urlObj
    this.method = method
    this.middlewares = middlewares
  }

  /**
   * Set request header
   */
  public set(headers: Headers): Keq<T>
  public set(headers: Record<string, string>): Keq<T>
  public set(name: string, value: string): Keq<T>
  public set(headersOrName: string | Record<string, string> | Headers, value?: string): Keq<T> {
    if (headersOrName instanceof Headers) {
      headersOrName.forEach((value, key) => {
        this.headers.set(key, value)
      })
    } else if (typeof headersOrName === 'string' && value) {
      this.headers.set(headersOrName, value)
    } else if (typeof headersOrName === 'object') {
      for (const [key, value] of Object.entries(headersOrName)) {
        this.headers.set(key, value)
      }
    }
    return this
  }

  /**
   * Setting the Content-Type
   */
  public type(contentType: ShorthandContentType | string): Keq<T> {
    const type = fixType(contentType)
    if (!type) throw new Error(messages.unknowContentType)
    this.headers.set('Content-Type', type)

    return this
  }

  /**
   * Http Basic Authentication
   */
  public auth(username: string, password: string): Keq<T> {
    this.headers.set('Authorization', `Basic ${encodeBase64(`${username}:${password}`)}`)
    return this
  }

  private appendFormDate(formData: FormData): void {
    if (!this.body) this.body = {}
    const body = this.body

    formData.forEach((value, key) => {
      if (key in body && Array.isArray(body[key])) {
        body[key].push(value)
      } else if (key in body && !Array.isArray(body[key])) {
        body[key] = [body[key]]
        body[key].push(value)
      } else {
        body[key] = value
      }
    })
  }

  private setType(contentType: ShorthandContentType | string): void {
    if (!this.headers.has('Content-Type')) this.type(contentType)
  }

  /**
   * set request body
   * @param value POST/PUT request body
   */
  public send(value: FormData | Record<string, any> | any[] | string): Keq<T> {
    if (Array.isArray(this.body)) {
      throw new Error('Cannot merge or overwrite body. Because it has been set as an array. ')
    }

    if (isFormData(value)) {
      if (Array.isArray(this.body)) throw new Error(messages.overwriteArrayBodyError)
      this.appendFormDate(value as FormData)
      this.setType('form-data')
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) this.body = value
      else this.body = { ...this.body, ...value }
      this.setType('json')
    } else if (typeof value === 'string') {
      const arr = value.split('=')
      if (arr.length !== 2) throw new Error('string is not expect')
      if (!this.body) this.body = {}
      this.body[arr[0]] = arr[1]
      this.setType('form')
    }

    return this
  }

  public field(arg1: string, value: string): Keq<T>
  public field(arg1: Record<string, string>): Keq<T>
  public field(arg1: string | Record<string, string>, arg2?: any): Keq<T> {
    if (Array.isArray(this.body)) {
      throw new Error('Cannot merge or overwrite body. Because it has been set as an array. ')
    }

    const formData = new FormData()
    if (typeof arg1 === 'object') {
      for (const key in arg1) {
        formData.append(key, arg1[key])
      }
    } else if (arg2) {
      formData.append(arg1, arg2)
    } else {
      throw new Error('Need value')
    }

    this.appendFormDate(formData as FormData)
    this.setType('form-data')
    return this
  }

  public attach(key: string, file: Blob | File | Buffer | Stream): Keq<T>
  public attach(key: string, file: Blob | File | Buffer | Stream, filename: string): Keq<T>
  public attach(key: string, file: Blob | File | Buffer | Stream, options: FormDataFieldOptions): Keq<T>
  public attach(key: string, file: Blob | File | Buffer | Stream, arg3: string | FormDataFieldOptions = 'blob'): Keq<T> {
    if (Array.isArray(this.body)) throw new Error(messages.overwriteArrayBodyError)

    if (!this.body) this.body = {}
    if (!isFile(file)) throw new Error(messages.fileExpected)

    const formData = new FormData()
    if (isBrowser && typeof arg3 === 'object') formData.set(key, file as any, arg3.filename)
    else formData.set(key, file as any, arg3 as any)

    this.appendFormDate(formData as FormData)
    this.setType('form-data')
    return this
  }

  public serialize(fn: SerializeBodyFn): Keq<T> {
    this.serializeBodyFn = fn
    return this
  }

  public use(middleware: Middleware): Keq<T>
  public use(host: string, middleware: Middleware): Keq<T>
  public use(matcher: MiddlewareMatcher, middleware: Middleware): Keq<T>
  public use(m: MiddlewareMatcher | string | Middleware, middleware?: Middleware): Keq<T> {
    if (!middleware) this.middlewares.push(m as Middleware)
    else if (typeof m === 'string') this.middlewares.push(matchMiddleware(matchHost(m), middleware))
    else this.middlewares.push(matchMiddleware(m as MiddlewareMatcher, middleware))

    return this
  }

  public query(key: Record<string, string | number | string[] | number[]>): Keq<T>
  public query(key: string, value: string | number | string[] | number[]): Keq<T>
  public query(key: string | Record<string, string | number | string[] | number[]>, value?: string | number | string[] | number[]): Keq<T> {
    if (typeof key === 'string' && value !== undefined) {
      this.urlObj.query[key] = String(value)
    } else if (typeof key === 'string' && value === undefined) {
      // ignore query
    } else if (typeof key === 'object') {
      for (const [k, v] of Object.entries(key)) {
        this.urlObj.query[k] = String(v)
      }
    } else {
      throw new Error('please set query value')
    }
    return this
  }

  public params(key: Record<string, string | number>): Keq<T>
  public params(key: string, value: string | number): Keq<T>
  public params(key: string | Record<string, string | number>, value?: string | number): Keq<T> {
    if (typeof key === 'string' && value !== undefined) {
      this.urlObj.params[key] = value
    } else if (typeof key === 'string' && value === undefined) {
      // ignore query
    } else if (typeof key === 'object') {
      for (const [k, v] of Object.entries(key)) {
        this.urlObj.params[k] = v
      }
    } else {
      throw new Error('please set params value')
    }

    return this
  }

  public option(key: 'resolveWithOriginalResponse', value?: true): Keq<Response>
  public option(key: 'resolveWithFullResponse', value?: true): Keq<Response>
  public option(key: 'redirect', value?: BuildInOptions['redirect']): Keq<T>
  public option(key: keyof BuildInOptions, value?: any): Keq<T>
  public option(key: string, value?: any): Keq<T>
  public option(key: keyof BuildInOptions | string, value: any = true): Keq<T> | Keq<Response> {
    this.opts[key] = value
    return this
  }

  public options(opts: OptionsWithoutFullResponse): Keq<T>
  public options(opts: OptionsWithFullResponse): Keq<Response>
  public options(opts: Options): Keq<T> | Keq<Response>
  public options(opts: Options): Keq<T> | Keq<Response> {
    this.opts = { ...this.options, ...opts }
    return this
  }

  /**
   *
   * @param retryTimes Max number of retries per call
   * @param initialRetryTime Initial value used to calculate the retry in milliseconds (This is still randomized following the randomization factor)
   * @param retryCallback Will be called after request failed
   */
  public retry(retryTime: number, retryCallback?: RetryCallback): Keq<T>
  public retry(retryTime: number, initialRetryTime: number, retryCallback?: RetryCallback): Keq<T>
  public retry(
    retryTimes: number,
    initialRetryTimeOrRetryCallback?: number | RetryCallback,
    retryCallback?: RetryCallback,
  ): Keq<T> {
    this.retryTimes = retryTimes

    if (typeof initialRetryTimeOrRetryCallback === 'number') {
      this.initialRetryTime = initialRetryTimeOrRetryCallback
      this.retryCallback = retryCallback
    } else if (typeof initialRetryTimeOrRetryCallback === 'function') {
      this.retryCallback = initialRetryTimeOrRetryCallback
    }

    return this
  }

  private async fetch(ctx: Context): Promise<void> {
    const urlobj = url.parse(url.format(ctx.request.url))

    if (urlobj.pathname) {
      try {
        const toPath = compile(urlobj.pathname, { encode: encodeURIComponent })
        urlobj.pathname = toPath(ctx.request.url.params)
      } catch (e) {
        throw new Error(`Cannot compile the params in ${urlobj.pathname}, Because ${(e as Error)?.message as string}.`)
      }
    }

    const uri = url.format(urlobj)

    const fetchOptions = {
      method: ctx.request.method.toUpperCase(),
      headers: ctx.request.headers,
      body: this.serializeBodyFn(ctx.request.body, ctx),
      ...ctx.request.options,
    }

    if (!fetchOptions.headers.has('Content-Type') && fetchOptions.body) {
      fetchOptions.headers.set('Content-Type', getTypeByBody(fetchOptions.body))
    }

    if (ctx.options.highWaterMark) {
      fetchOptions['highWaterMark'] = ctx.options.highWaterMark
    }

    /**
     * Content-Type should be removed when it is 'multipart/form-data
     * FetchAPI will auth set it and add boundary
     */
    if (fetchOptions.headers.get('content-type')?.toLocaleLowerCase() === 'multipart/form-data') {
      fetchOptions.headers.delete('content-type')
    }

    const res = await ctx.options.fetchAPI(uri, fetchOptions)

    if (!isBrowser) {
      // node-fetch does not implement Response.formData()
      res.formData = async function() {
        const str = await this.text()
        const contentType = this.headers.get('content-type')
        if (!contentType) throw new Error('Cannot parse form-data body without content-type')
        const boundary = getBoundaryByContentType(contentType)
        return parseFormData(str, boundary)
      }
    }

    const cache: Record<string, Promise<any>> = {}
    ctx.res = new Proxy(res, {
      get(target, property) {
        if (!(typeof property === 'string' && ['json', 'formData', 'text'].includes(property))) return target[property]

        return () => {
          if (!(property in cache)) cache[property] = target[property]()

          return cache[property].then(data => R.clone(data))
        }
      },
    })

    if (ctx.options.resolveWithFullResponse) {
      ctx.output = ctx.response
    } else if (ctx.options.resolveWithOriginalResponse) {
      ctx.output = ctx.res
    } else {
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) ctx.output = ctx.response && await ctx.response.json()
      else if (contentType.includes('multipart/form-data')) ctx.output = ctx.response && await ctx.response.formData()
      else if (contentType.includes('plain/text')) ctx.output = ctx.response && await ctx.response.text()
      else ctx.output = ctx.response && await ctx.response.body
    }
  }

  private async run(): Promise<T> {
    const headers = new Headers()
    this.headers.forEach((value, key) => {
      headers.set(key, value)
    })

    const request: RequestContext = {
      method: this.method,
      url: clone(this.urlObj),
      headers,
      body: clone(this.body),
      options: {},
    }

    if (this.opts.redirect) request.options.redirect = this.opts.redirect

    const ctx: Context = {
      request,

      options: clone({ ...this.opts, fetchAPI: this.opts.fetchAPI || fetch }),
      output: undefined,

      get url() {
        return this.request.url
      },
      set url(value: RequestContext['url']) {
        this.request.url = value
      },

      get params() {
        return this.url.params
      },
      set params(value: RequestContext['url']['params']) {
        this.params = value
      },

      get query() {
        return this.url.query
      },
      set query(value: RequestContext['url']['query']) {
        this.url.query = value
      },

      get headers() {
        return this.request.headers
      },
      set headers(value: RequestContext['headers']) {
        this.request.headers = value
      },

      get body() {
        return this.request.body
      },
      set body(value: RequestContext['body']) {
        this.request.body = value
      },


      get response() {
        return this.res
      },
    }


    const middleware = compose([...this.middlewares, this.fetch.bind(this)])
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await middleware(ctx, async() => {})

    return ctx.output
  }

  public async end(): Promise<T> {
    let times = this.retryTimes + 1
    let result: T
    let error: any

    while (times) {
      try {
        result = await this.run()
        return result
        // break
      } catch (e) {
        times -= 1
        error = e
        if (this.retryCallback) await this.retryCallback(e as Error)
        if (this.initialRetryTime) await sleep(this.initialRetryTime)
      }
    }
    throw error
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
    if (!this.requestPromise) this.requestPromise = this.end()
    return this.requestPromise.then(onfulfilled, onrejected)
  }

  public catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult> {
    return this.end().catch(onrejected)
  }
}
