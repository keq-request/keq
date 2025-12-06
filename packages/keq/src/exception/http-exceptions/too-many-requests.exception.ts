import { RequestException } from './request.exception'


export class TooManyRequestsException extends RequestException {
  constructor(message: string = 'Too Many Requests', retry = true) {
    super(429, message, retry)

    Object.defineProperty(this, 'name', { value: 'TooManyRequestsException' })
  }
}
