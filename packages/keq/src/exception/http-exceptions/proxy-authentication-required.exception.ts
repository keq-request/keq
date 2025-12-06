import { RequestException } from './request.exception'


export class ProxyAuthenticationRequiredException extends RequestException {
  constructor(message: string = 'Proxy Authentication Required', retry = false) {
    super(407, message, retry)

    Object.defineProperty(this, 'name', {
      value: 'ProxyAuthenticationRequiredException',
    })
  }
}
