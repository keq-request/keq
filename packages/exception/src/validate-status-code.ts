import { KeqMiddleware } from 'keq'
import { createExceptionByStatusCode } from './create-exception-by-status-code.js'

export function validateStatusCode(): KeqMiddleware {
  return async function validateStatusCode(context, next) {
    await next()

    const response = context.response
    if (!response) return

    const { status } = response

    // 2xx success status codes - no error
    if (status >= 200 && status < 300) return

    // 3xx redirection status codes - no error (handled by fetch)
    if (status >= 300 && status < 400) return

    throw createExceptionByStatusCode(response)
  }
}
