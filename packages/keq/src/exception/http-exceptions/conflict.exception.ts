import { RequestException, RequestExceptionOptions } from './request.exception'


export class ConflictException extends RequestException {
  constructor(message: string = 'Conflict', options?: RequestExceptionOptions) {
    super(409, message, { fatal: true, ...options })

    Object.defineProperty(this, 'name', { value: 'ConflictException' })
  }
}
