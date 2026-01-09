import { RequestException, RequestExceptionOptions } from './request.exception'


export class ImATeapotException extends RequestException {
  constructor(message: string = "I'm a teapot", options?: RequestExceptionOptions) {
    super(418, message, { fatal: true, ...options })

    Object.defineProperty(this, 'name', { value: 'ImATeapotException' })
  }
}
