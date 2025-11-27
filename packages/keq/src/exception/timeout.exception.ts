import { AbortException } from './abort.exception.js'


export class TimeoutException extends AbortException {
  constructor(msg: string) {
    super(msg)
  }
}
