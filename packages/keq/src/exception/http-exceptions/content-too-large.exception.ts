import { RequestException, RequestExceptionOptions } from './request.exception'


export class ContentTooLargeException extends RequestException {
  constructor(message: string = 'Content Too Large', options?: RequestExceptionOptions) {
    super(413, message, { fatal: true, ...options })

    Object.defineProperty(this, 'name', {
      value: 'ContentTooLargeException',
    })
  }
}
