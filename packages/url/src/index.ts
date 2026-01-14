import { KeqMiddleware } from 'keq'


export function setBaseUrl(base: string): KeqMiddleware {
  if (!base.startsWith('//') && base.startsWith('/')) {
    const prefix = base.replace(/\/$/, '')

    return async function setBaseUrl(ctx, next) {
      ctx.request.url.pathname = `${prefix}/${ctx.request.url.pathname.replace(/^\//, '')}`
      await next()
    }
  }

  const url = new URL(base)
  const protocol = url.protocol
  const host = url.host
  const prefix = url.pathname.replace(/\/$/, '')

  return async function setBaseUrl(ctx, next) {
    ctx.request.url.protocol = protocol
    ctx.request.url.host = host
    ctx.request.url.pathname = `${prefix}/${ctx.request.url.pathname.replace(/^\//, '')}`

    // Fix bug in chrome@74 bug:
    //   url.port will return `""` if the base url not contain port.
    //   And when ctx.response.url.port is set to `""`, `null` or `undefined`, it will return `:0` in ctx.response.url.href
    if (url.port) {
      ctx.request.url.port = url.port
    }

    await next()
  }
}

export function setOrigin(origin: string): KeqMiddleware {
  const url = new URL(origin)

  return async function setOrigin(ctx, next) {
    ctx.request.url.host = url.host
    ctx.request.url.protocol = url.protocol

    // Fix bug in chrome@74 bug:
    //   url.port will return `""` if the base url not contain port.
    //   And when ctx.response.url.port is set to `""`, `null` or `undefined`, it will return `:0` in ctx.response.url.href
    if (url.port) {
      ctx.request.url.port = url.port
    }

    await next()
  }
}

export function setHost(host: string): KeqMiddleware {
  return async function setHost(ctx, next) {
    ctx.request.url.host = host
    await next()
  }
}
