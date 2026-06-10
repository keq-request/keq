import { Exception } from './exception.js'


export class MutexException extends Exception {
  constructor(message: string) {
    super(message)

    Object.defineProperty(this, 'name', { value: 'MutexException' })
  }
}
