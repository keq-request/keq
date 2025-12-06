import { RequestException } from './request.exception'


export class ImATeapotException extends RequestException {
  constructor(message: string = "I'm a teapot", retry = false) {
    super(418, message, retry)

    Object.defineProperty(this, 'name', { value: 'ImATeapotException' })
  }
}
