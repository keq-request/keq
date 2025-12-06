import { RequestException } from './request.exception'


export class ContentTooLargeException extends RequestException {
  constructor(message: string = 'Content Too Large', retry = false) {
    super(413, message, retry)

    Object.defineProperty(this, 'name', {
      value: 'ContentTooLargeException',
    })
  }
}
