import { RequestException } from './request.exception'

export class MethodNotAllowedException extends RequestException {
  constructor(message: string = 'Method Not Allowed', retry = false) {
    super(405, message, retry)

    Object.defineProperty(this, 'name', {
      value: 'MethodNotAllowedException',
    })
  }
}
