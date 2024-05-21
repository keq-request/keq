import { Exception } from './exception.js'


export class FileExpectedException extends Exception {
  constructor() {
    super('File/Blob (Browser) or Buffer (NodeJS) expected')
  }
}
