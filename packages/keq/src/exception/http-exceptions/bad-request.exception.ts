import { RequestException, RequestExceptionOptions } from './request.exception'


export class BadRequestException extends RequestException {
  constructor(message: string = 'Bad Request', options?: RequestExceptionOptions) {
    super(400, message, { fatal: true, ...options })

    Object.defineProperty(this, 'name', { value: 'BadRequestException' })
  }
}
