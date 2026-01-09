import { RequestException, RequestExceptionOptions } from './request.exception'

export class UnsupportedMediaTypeException extends RequestException {
  constructor(message: string = 'Unsupported Media Type', options?: RequestExceptionOptions) {
    super(415, message, { fatal: true, ...options })

    Object.defineProperty(this, 'name', { value: 'UnsupportedMediaTypeException' })
  }
}
