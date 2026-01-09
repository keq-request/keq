import { RequestException, RequestExceptionOptions } from './request.exception'


export class UriTooLongException extends RequestException {
  constructor(message: string = 'URI Too Long', options?: RequestExceptionOptions) {
    super(414, message, { fatal: true, ...options })

    Object.defineProperty(this, 'name', { value: 'UriTooLongException' })
  }
}
