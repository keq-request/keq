import type { KeqMiddleware } from 'keq'

export function clarifyFetchFailed(): KeqMiddleware {
  return async function clarifyFetchFailedMiddleware(ctx, next) {
    try {
      await next()
    } catch (error) {
      throw resolveCause(error)
    }
  }
}

function resolveCause(error: unknown): unknown {
  if (!(error instanceof Error)) return error

  const causes: string[] = []
  let current: unknown = error.cause
  while (current instanceof Error) {
    causes.push(current.message)
    current = current.cause
  }

  if (!causes.length) return error

  const enhanced = new (error.constructor as new (message: string, options?: { cause?: unknown }) => Error)(
    `${error.message}: ${causes.join(' - ')}`,
    { cause: error.cause },
  )
  return enhanced
}
