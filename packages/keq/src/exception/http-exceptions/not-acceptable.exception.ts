import { RequestException, RequestExceptionOptions } from './request.exception'


export class NotAcceptableException extends RequestException {
  constructor(message: string = 'Not Acceptable', options?: RequestExceptionOptions) {
    super(406, message, { fatal: true, ...options })

    Object.defineProperty(this, 'name', { value: 'NotAcceptableException' })
  }
}
