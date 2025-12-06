import { RequestException } from './request.exception'

export class ServiceUnavailableException extends RequestException {
  constructor(message: string = 'Service Unavailable', retry = true) {
    super(503, message, retry)

    Object.defineProperty(this, 'name', {
      value: 'ServiceUnavailableException',
    })
  }
}
