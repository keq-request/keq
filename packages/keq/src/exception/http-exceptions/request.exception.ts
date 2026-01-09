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

  constructor(statusCode: number | string, message?: string, options?: RequestExceptionOptions) {
    super(message)

    this.statusCode = statusCode
    this.retry = !options?.fatal
    this.response = options?.response

    Object.defineProperty(this, 'name', { value: 'RequestException' })
  }
}
