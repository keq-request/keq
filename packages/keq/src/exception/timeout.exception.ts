import { AbortException } from './abort.exception'


export class TimeoutException extends AbortException {
  constructor(msg: string) {
    super(msg)
  }
}
