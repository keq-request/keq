import { RequestException } from './request.exception'

export class NotFoundedException extends RequestException {
  constructor(message: string = 'Not Founded', retry = false) {
    super(404, message, retry)

    Object.defineProperty(this, 'name', { value: 'NotFoundedException' })
  }
}
