import { Exception } from './exception'


export class OverwriteArrayBodyException extends Exception {
  constructor() {
    super('Cannot merge or overwrite body, because it has been set as an array. Please use .body(arr) instead')
  }
}
