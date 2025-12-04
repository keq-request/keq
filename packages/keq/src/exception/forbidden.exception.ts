import { RequestException } from './request.exception'


export class ForbiddenException extends RequestException {
  constructor(message: string = 'Forbidden', retry = false) {
    super(403, message, retry)

    Object.defineProperty(this, 'name', { value: 'ForbiddenException' })
  }
}
