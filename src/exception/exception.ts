import { CustomError } from 'ts-custom-error'

export class Exception extends CustomError {
  constructor(message?: string) {
    super(message)

    Object.defineProperty(this, 'name', { value: 'KeqError' })
  }
}
