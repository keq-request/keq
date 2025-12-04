import { RequestException } from './request.exception'

export class PreconditionFailedException extends RequestException {
  constructor(message: string = 'Precondition Failed', retry = false) {
    super(412, message, retry)

    Object.defineProperty(this, 'name', {
      value: 'PreconditionFailedException',
    })
  }
}
