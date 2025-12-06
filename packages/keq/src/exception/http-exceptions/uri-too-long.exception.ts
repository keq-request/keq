import { RequestException } from './request.exception'


export class UriTooLongException extends RequestException {
  constructor(message: string = 'URI Too Long', retry = false) {
    super(414, message, retry)

    Object.defineProperty(this, 'name', { value: 'UriTooLongException' })
  }
}
