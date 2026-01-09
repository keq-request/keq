import { RequestException, RequestExceptionOptions } from './request.exception'

export class InternalServerErrorException extends RequestException {
  constructor(message: string = 'Internal Server Error', options?: RequestExceptionOptions) {
    super(500, message, { fatal: false, ...options })

    Object.defineProperty(this, 'name', {
      value: 'InternalServerErrorException',
    })
  }
}
