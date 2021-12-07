import { Exception } from './exception'


export class UnknowContentTypeException extends Exception {
  constructor() {
    super('Unknow Content-Type')
  }
}
