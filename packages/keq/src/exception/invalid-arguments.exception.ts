import { Exception } from './exception.js'


export class InvalidArgumentsExceptions extends Exception {
  constructor() {
    super('Invalid arguments')
  }
}
