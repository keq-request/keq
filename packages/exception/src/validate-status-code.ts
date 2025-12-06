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
} from 'keq'

export function validateStatusCode(): KeqMiddleware {
  return async (context, next) => {
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
        throw new BadRequestException(statusText)
      case 401:
        throw new UnauthorizedException(statusText)
      case 403:
        throw new ForbiddenException(statusText)
      case 404:
        throw new NotFoundedException(statusText)
      case 406:
        throw new NotAcceptableException(statusText)
      case 409:
        throw new ConflictException(statusText)
      case 412:
        throw new PreconditionFailedException(statusText)
      case 418:
        throw new ImATeapotException(statusText)
      default:
        // Other 4xx errors, don't retry by default
        throw new RequestException(status, statusText, false)
      }
    }

    // 5xx server errors
    if (status >= 500) {
      switch (status) {
      case 500:
        throw new InternalServerErrorException(statusText)
      case 502:
        throw new BadGatewayException(statusText)
      case 503:
        throw new ServiceUnavailableException(statusText)
      case 504:
        throw new GatewayTimeoutException(statusText)
      default:
        // Other 5xx errors, retry by default
        throw new RequestException(status, statusText, true)
      }
    }
  }
}
