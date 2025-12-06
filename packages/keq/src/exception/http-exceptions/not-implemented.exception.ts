import { RequestException } from './request.exception'

export class NotImplementedException extends RequestException {
  constructor(message: string = 'Not Implemented', retry = false) {
    super(501, message, retry)

    Object.defineProperty(this, 'name', { value: 'NotImplementedException' })
  }
}
