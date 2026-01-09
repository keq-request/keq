import { RequestException, RequestExceptionOptions } from './request.exception'


export class ProxyAuthenticationRequiredException extends RequestException {
  constructor(message: string = 'Proxy Authentication Required', options?: RequestExceptionOptions) {
    super(407, message, { fatal: true, ...options })

    Object.defineProperty(this, 'name', {
      value: 'ProxyAuthenticationRequiredException',
    })
  }
}
