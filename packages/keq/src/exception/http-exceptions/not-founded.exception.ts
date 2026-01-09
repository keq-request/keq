import { RequestException, RequestExceptionOptions } from './request.exception'

export class NotFoundedException extends RequestException {
  constructor(message: string = 'Not Founded', options?: RequestExceptionOptions) {
    super(404, message, { fatal: true, ...options })

    Object.defineProperty(this, 'name', { value: 'NotFoundedException' })
  }
}
