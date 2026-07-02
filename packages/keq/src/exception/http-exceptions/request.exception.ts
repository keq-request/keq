import { Exception } from '../exception.js'


export interface RequestExceptionOptions {
  // disable retry for this exception
  fatal?: boolean

  // proxy response object
  response?: Response
}

export class RequestException extends Exception {
  statusCode: number | string
  retry: boolean
  response?: Response

  /** @deprecated Pass `RequestExceptionOptions` instead. `retry: true` maps to `{ fatal: false }`. */
  constructor(statusCode: number | string, message: string, retry: boolean)
  constructor(statusCode: number | string, message?: string, options?: RequestExceptionOptions)
  constructor(statusCode: number | string, message?: string, options?: boolean | RequestExceptionOptions) {
    super(message)

    if (typeof options === 'boolean') {
      options = { fatal: !options }
    }

    this.statusCode = statusCode
    this.retry = !options?.fatal
    this.response = options?.response

    Object.defineProperty(this, 'name', { value: 'RequestException' })
  }
}
