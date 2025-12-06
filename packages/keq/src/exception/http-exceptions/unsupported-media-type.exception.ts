import { RequestException } from './request.exception'

export class UnsupportedMediaTypeException extends RequestException {
  constructor(message: string = 'Unsupported Media Type', retry = false) {
    super(415, message, retry)

    Object.defineProperty(this, 'name', { value: 'UnsupportedMediaTypeException' })
  }
}
