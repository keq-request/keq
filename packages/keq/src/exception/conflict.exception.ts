import { RequestException } from './request.exception'


export class ConflictException extends RequestException {
  constructor(message: string = 'Conflict', retry = false) {
    super(409, message, retry)

    Object.defineProperty(this, 'name', { value: 'ConflictException' })
  }
}
