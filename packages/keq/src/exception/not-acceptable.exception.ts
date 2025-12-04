import { RequestException } from './request.exception'


export class NotAcceptableException extends RequestException {
  constructor(message: string = 'Not Acceptable', retry = false) {
    super(406, message, retry)

    Object.defineProperty(this, 'name', { value: 'NotAcceptableException' })
  }
}
