export class AbortException extends DOMException {
  constructor(message = 'Request aborted') {
    super(message, 'AbortError')
    Object.setPrototypeOf(this, AbortException.prototype)
  }
}
