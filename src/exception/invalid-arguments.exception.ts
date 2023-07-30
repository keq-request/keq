import { Exception } from './exception'


export class InvalidArgumentsExceptions extends Exception {
  constructor() {
    super('Invalid arguments')
  }
}
