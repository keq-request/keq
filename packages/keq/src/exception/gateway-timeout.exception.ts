import { RequestException } from './request.exception'

export class GatewayTimeoutException extends RequestException {
  constructor(message: string = 'Gateway Timeout', retry = false) {
    super(504, message, retry)

    Object.defineProperty(this, 'name', { value: 'GatewayTimeoutException' })
  }
}
