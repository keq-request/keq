import { RequestException, RequestExceptionOptions } from './request.exception'

export class PreconditionFailedException extends RequestException {
  constructor(message: string = 'Precondition Failed', options?: RequestExceptionOptions) {
    super(412, message, { fatal: true, ...options })

    Object.defineProperty(this, 'name', {
      value: 'PreconditionFailedException',
    })
  }
}
