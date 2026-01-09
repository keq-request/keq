import { RequestException, RequestExceptionOptions } from './request.exception'

export class MethodNotAllowedException extends RequestException {
  constructor(message: string = 'Method Not Allowed', options?: RequestExceptionOptions) {
    super(405, message, { fatal: true, ...options })

    Object.defineProperty(this, 'name', {
      value: 'MethodNotAllowedException',
    })
  }
}
