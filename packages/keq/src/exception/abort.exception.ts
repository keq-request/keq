export class AbortException extends DOMException {
  constructor(msg: string) {
    super(msg, 'AbortError')
    Object.setPrototypeOf(this, AbortException.prototype)
  }
}
