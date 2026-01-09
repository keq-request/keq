import { RequestException, RequestExceptionOptions } from './request.exception'


export class BadGatewayException extends RequestException {
  constructor(message: string = 'Bad Gateway', options?: RequestExceptionOptions) {
    super(502, message, { fatal: false, ...options })

    Object.defineProperty(this, 'name', { value: 'BadGatewayException' })
  }
}
