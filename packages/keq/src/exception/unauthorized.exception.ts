import { RequestException } from './request.exception'

export class UnauthorizedException extends RequestException {
  constructor(message: string = 'Unauthorized', retry = false) {
    super(401, message, retry)

    Object.defineProperty(this, 'name', { value: 'UnauthorizedException' })
  }
}
