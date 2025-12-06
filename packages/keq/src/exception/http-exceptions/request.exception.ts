import { Exception } from '../exception.js'


export class RequestException extends Exception {
  statusCode: number
  retry: boolean

  constructor(statusCode: number, message?: string, retry = true) {
    super(message)

    this.statusCode = statusCode
    this.retry = retry

    Object.defineProperty(this, 'name', { value: 'RequestException' })
  }
}
