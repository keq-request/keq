import { RequestException } from './request.exception'


export class RequestTimeoutException extends RequestException {
  constructor(message: string = 'Request Timeout', retry = true) {
    super(408, message, retry)

    Object.defineProperty(this, 'name', {
      value: 'RequestTimeoutException',
    })
  }
}
