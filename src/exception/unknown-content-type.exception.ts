import { Exception } from './exception'


export class UnknownContentTypeException extends Exception {
  constructor() {
    super('Unknow Content-Type')
  }
}
