import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  InternalServerErrorException,
  KeqMiddleware,
  NotAcceptableException,
  NotFoundedException,
  PreconditionFailedException,
  RequestException,
  ServiceUnavailableException,
  UnauthorizedException,
  ImATeapotException,
  MethodNotAllowedException,
  UriTooLongException,
  ContentTooLargeException,
  ProxyAuthenticationRequiredException,
  RequestTimeoutException,
  TooManyRequestsException,
  NotImplementedException,
  UnsupportedMediaTypeException,
} from 'keq'

export function validateStatusCode(): KeqMiddleware {
  return async function validateStatusCode(context, next) {
    await next()

    const response = context.response
    if (!response) return

    const { status, statusText } = response

    // 2xx success status codes - no error
    if (status >= 200 && status < 300) return

    // 3xx redirection status codes - no error (handled by fetch)
    if (status >= 300 && status < 400) return

    // 4xx client errors
    if (status >= 400 && status < 500) {
      switch (status) {
        case 400:
          throw new BadRequestException(statusText, { response })
        case 401:
          throw new UnauthorizedException(statusText, { response })
        case 403:
          throw new ForbiddenException(statusText, { response })
        case 404:
          throw new NotFoundedException(statusText, { response })
        case 405:
          throw new MethodNotAllowedException(statusText, { response })
        case 406:
          throw new NotAcceptableException(statusText, { response })
        case 407:
          throw new ProxyAuthenticationRequiredException(statusText, { response })
        case 408:
          throw new RequestTimeoutException(statusText, { response })
        case 409:
          throw new ConflictException(statusText, { response })
        case 412:
          throw new PreconditionFailedException(statusText, { response })
        case 413:
          throw new ContentTooLargeException(statusText, { response })
        case 414:
          throw new UriTooLongException(statusText, { response })
        case 415:
          throw new UnsupportedMediaTypeException(statusText, { response })
        case 418:
          throw new ImATeapotException(statusText, { response })
        case 429:
          throw new TooManyRequestsException(statusText, { response })
        default:
        // Other 4xx errors, don't retry by default
          throw new RequestException(status, statusText, { fatal: true, response })
      }
    }

    // 5xx server errors
    if (status >= 500) {
      switch (status) {
        case 500:
          throw new InternalServerErrorException(statusText, { response })
        case 501:
          throw new NotImplementedException(statusText, { response })
        case 502:
          throw new BadGatewayException(statusText, { response })
        case 503:
          throw new ServiceUnavailableException(statusText, { response })
        case 504:
          throw new GatewayTimeoutException(statusText, { response })
        default:
        // Other 5xx errors, retry by default
          throw new RequestException(status, statusText, { fatal: false, response })
      }
    }
  }
}
