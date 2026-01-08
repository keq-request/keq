import { Exception } from '../exception.js'


export class RequestException extends Exception {
  statusCode: number | string
  retry: boolean

  constructor(statusCode: number | string, message?: string, retry = true) {
    super(message)

    this.statusCode = statusCode
    this.retry = retry

    Object.defineProperty(this, 'name', { value: 'RequestException' })
  }
}
