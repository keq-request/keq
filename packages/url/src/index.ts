import { KeqMiddleware } from 'keq'


/**
 * Replace the origin (protocol, host and port) of `target` with that of `origin`.
 */
function applyOrigin(target: URL, origin: URL): void {
  target.protocol = origin.protocol
  target.host = origin.host
  // Assign the port even when it is empty: assigning `host` alone keeps a port
  // that was already on the request URL, and an empty port clears it. The
  // chrome@74 workaround that skipped empty ports is unnecessary for the
  // package's chrome91+ target.
  target.port = origin.port
}


export function setBaseUrl(base: string): KeqMiddleware {
  if (!base.startsWith('//') && base.startsWith('/')) {
    const prefix = base.replace(/\/$/, '')

    return async function setBaseUrl(ctx, next) {
      ctx.request.url.pathname = `${prefix}/${ctx.request.url.pathname.replace(/^\//, '')}`
      await next()
    }
  }

  const url = new URL(base)
  const prefix = url.pathname.replace(/\/$/, '')

  return async function setBaseUrl(ctx, next) {
    applyOrigin(ctx.request.url, url)
    ctx.request.url.pathname = `${prefix}/${ctx.request.url.pathname.replace(/^\//, '')}`

    await next()
  }
}

export function setOrigin(origin: string): KeqMiddleware {
  const url = new URL(origin)

  return async function setOrigin(ctx, next) {
    applyOrigin(ctx.request.url, url)

    await next()
  }
}

export function setHost(host: string): KeqMiddleware {
  return async function setHost(ctx, next) {
    ctx.request.url.host = host
    await next()
  }
}
