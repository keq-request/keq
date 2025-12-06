import { RequestException } from './request.exception'


export class BadRequestException extends RequestException {
  constructor(message: string = 'Bad Request', retry = false) {
    super(400, message, retry)

    Object.defineProperty(this, 'name', { value: 'BadRequestException' })
  }
}
