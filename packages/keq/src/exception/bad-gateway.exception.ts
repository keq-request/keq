import { RequestException } from './request.exception'


export class BadGatewayException extends RequestException {
  constructor(message: string = 'Bad Gateway', retry = false) {
    super(502, message, retry)

    Object.defineProperty(this, 'name', { value: 'BadGatewayException' })
  }
}
