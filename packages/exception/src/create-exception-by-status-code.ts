import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  InternalServerErrorException,
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

export function createExceptionByStatusCode(response: Response): Error {
  const { status, statusText } = response

  // 4xx client errors
  if (status >= 400 && status < 500) {
    switch (status) {
      case 400:
        return new BadRequestException(statusText, { response })
      case 401:
        return new UnauthorizedException(statusText, { response })
      case 403:
        return new ForbiddenException(statusText, { response })
      case 404:
        return new NotFoundedException(statusText, { response })
      case 405:
        return new MethodNotAllowedException(statusText, { response })
      case 406:
        return new NotAcceptableException(statusText, { response })
      case 407:
        return new ProxyAuthenticationRequiredException(statusText, { response })
      case 408:
        return new RequestTimeoutException(statusText, { response })
      case 409:
        return new ConflictException(statusText, { response })
      case 412:
        return new PreconditionFailedException(statusText, { response })
      case 413:
        return new ContentTooLargeException(statusText, { response })
      case 414:
        return new UriTooLongException(statusText, { response })
      case 415:
        return new UnsupportedMediaTypeException(statusText, { response })
      case 418:
        return new ImATeapotException(statusText, { response })
      case 429:
        return new TooManyRequestsException(statusText, { response })
      default:
        // Other 4xx errors, don't retry by default
        return new RequestException(status, statusText, { fatal: true, response })
    }
  }

  // 5xx server errors
  if (status >= 500) {
    switch (status) {
      case 500:
        return new InternalServerErrorException(statusText, { response })
      case 501:
        return new NotImplementedException(statusText, { response })
      case 502:
        return new BadGatewayException(statusText, { response })
      case 503:
        return new ServiceUnavailableException(statusText, { response })
      case 504:
        return new GatewayTimeoutException(statusText, { response })
      default:
        // Other 5xx errors, retry by default
        return new RequestException(status, statusText, { fatal: false, response })
    }
  }

  return new RequestException(status, statusText, { fatal: false, response })
}
