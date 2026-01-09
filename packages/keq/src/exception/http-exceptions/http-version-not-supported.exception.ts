import { RequestException, RequestExceptionOptions } from './request.exception'

export class HttpVersionNotSupportedException extends RequestException {
  constructor(message: string = 'HTTP Version Not Supported', options?: RequestExceptionOptions) {
    super(505, message, { fatal: true, ...options })

    Object.defineProperty(this, 'name', {
      value: 'HttpVersionNotSupportedException',
    })
  }
}
