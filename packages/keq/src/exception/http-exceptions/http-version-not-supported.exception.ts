import { RequestException } from './request.exception'

export class HttpVersionNotSupportedException extends RequestException {
  constructor(message: string = 'HTTP Version Not Supported', retry = false) {
    super(505, message, retry)

    Object.defineProperty(this, 'name', {
      value: 'HttpVersionNotSupportedException',
    })
  }
}
