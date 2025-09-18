import type { KeqMiddleware } from 'keq'

/**
 * Set a header.
 * If it already exists, the original value will be overwritten.
 *
 * 设置一个Header
 * 如果Header已经存在，则会覆盖原来的值
 */
export function setHeader(key: string, value: string): KeqMiddleware {
  return async function setHeader(ctx, next) {
    ctx.request.headers.set(key, value)
    await next()
  }
}

/**
 * Set headers.
 * If it already exists, the original value will be overwritten.
 *
 * 设置多个Header
 * 如果Header已经存在，则会覆盖原来的值
 */
export function setHeaders(headers: Record<string, string>): KeqMiddleware {
  return async function setHeaders(ctx, next) {
    for (const key in headers) {
      ctx.request.headers.set(key, headers[key])
    }

    await next()
  }
}

/**
 * Append a header
 *
 * 追加一个Header
 */
export function appendHeader(key: string, value: string): KeqMiddleware {
  return async function appendHeader(ctx, next) {
    ctx.request.headers.append(key, value)
    await next()
  }
}

/**
 * Append headers
 *
 * 追加多个Header
 */
export function appendHeaders(headers: Record<string, string>): KeqMiddleware {
  return async function appendHeaders(ctx, next) {
    for (const key in headers) {
      ctx.request.headers.append(key, headers[key])
    }
    await next()
  }
}


/**
 * Set a header, if it isn't existed.
 *
 * 添加一个Header，如果Header的Key已存在，则不添加
 */
export function insertHeader(key: string, value: string): KeqMiddleware {
  return async function insertHeader(ctx, next) {
    if (!ctx.request.headers.has(key)) {
      ctx.request.headers.set(key, value)
    }
    await next()
  }
}

/**
 * Set headers, if it isn't existed.
 *
 * 添加多个Header，已存在的Header将被忽略
 */
export function insertHeaders(headers: Record<string, string>): KeqMiddleware {
  return async function insertHeaders(ctx, next) {
    for (const key in headers) {
      if (!ctx.request.headers.has(key)) {
        ctx.request.headers.set(key, headers[key])
      }
    }

    await next()
  }
}
