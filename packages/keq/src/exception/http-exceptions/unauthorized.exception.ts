import { RequestException, RequestExceptionOptions } from './request.exception'

export class UnauthorizedException extends RequestException {
  constructor(message: string = 'Unauthorized', options?: RequestExceptionOptions) {
    super(401, message, { fatal: true, ...options })

    Object.defineProperty(this, 'name', { value: 'UnauthorizedException' })
  }
}
