import { RequestException, RequestExceptionOptions } from './request.exception'

export class NotImplementedException extends RequestException {
  constructor(message: string = 'Not Implemented', options?: RequestExceptionOptions) {
    super(501, message, { fatal: true, ...options })

    Object.defineProperty(this, 'name', { value: 'NotImplementedException' })
  }
}
