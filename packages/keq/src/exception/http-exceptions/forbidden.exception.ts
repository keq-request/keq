import { RequestException, RequestExceptionOptions } from './request.exception'


export class ForbiddenException extends RequestException {
  constructor(message: string = 'Forbidden', options?: RequestExceptionOptions) {
    super(403, message, { fatal: true, ...options })

    Object.defineProperty(this, 'name', { value: 'ForbiddenException' })
  }
}
