import { RequestException, RequestExceptionOptions } from './request.exception'

export class GatewayTimeoutException extends RequestException {
  constructor(message: string = 'Gateway Timeout', options?: RequestExceptionOptions) {
    super(504, message, { fatal: false, ...options })

    Object.defineProperty(this, 'name', { value: 'GatewayTimeoutException' })
  }
}
