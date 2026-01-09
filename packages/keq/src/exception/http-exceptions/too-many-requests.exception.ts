import { RequestException, RequestExceptionOptions } from './request.exception'


export class TooManyRequestsException extends RequestException {
  constructor(message: string = 'Too Many Requests', options?: RequestExceptionOptions) {
    super(429, message, { fatal: false, ...options })

    Object.defineProperty(this, 'name', { value: 'TooManyRequestsException' })
  }
}
