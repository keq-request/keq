import { Exception } from './exception.js'


export class TypeException extends Exception {
  constructor(msg?: string) {
    super(msg || 'Invalid Type')
  }
}
