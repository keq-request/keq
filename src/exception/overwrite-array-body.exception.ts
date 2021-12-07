import { Exception } from './exception'


export class OverwriteArrayBodyException extends Exception {
  constructor() {
    super('Cannot merge or overwrite body. Because it has been set as an array.')
  }
}
