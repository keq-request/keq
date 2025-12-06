import { RequestException } from './request.exception'


export class BadGatewayException extends RequestException {
  constructor(message: string = 'Bad Gateway', retry = true) {
    super(502, message, retry)

    Object.defineProperty(this, 'name', { value: 'BadGatewayException' })
  }
}
