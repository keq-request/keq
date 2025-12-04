import { RequestException } from './request.exception'

export class InternalServerErrorException extends RequestException {
  constructor(message: string = 'Internal Server Error', retry = true) {
    super(500, message, retry)

    Object.defineProperty(this, 'name', {
      value: 'InternalServerErrorException',
    })
  }
}
