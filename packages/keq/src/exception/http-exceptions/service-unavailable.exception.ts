import { RequestException, RequestExceptionOptions } from './request.exception'


export class ServiceUnavailableException extends RequestException {
  constructor(message: string = 'Service Unavailable', options?: RequestExceptionOptions) {
    super(503, message, { fatal: false, ...options })

    Object.defineProperty(this, 'name', {
      value: 'ServiceUnavailableException',
    })
  }
}
