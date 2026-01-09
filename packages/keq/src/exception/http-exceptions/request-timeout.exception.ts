import { RequestException, RequestExceptionOptions } from './request.exception'


export class RequestTimeoutException extends RequestException {
  constructor(message: string = 'Request Timeout', options?: RequestExceptionOptions) {
    super(408, message, { fatal: false, ...options })

    Object.defineProperty(this, 'name', {
      value: 'RequestTimeoutException',
    })
  }
}
