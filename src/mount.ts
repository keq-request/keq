import {
  MiddlewareMatcher,
  Context,
  Mounter,
  RequestMethod,
} from '@/types'
import { Exception } from '@/exception'
import minimatch from 'minimatch'
import { isBrowser } from './util'


function createMounter(matcher: MiddlewareMatcher): Mounter {
  const mounter: Mounter = ctx => matcher(ctx)
  mounter.pathname = arg => compose(mounter, pathname(arg))
  mounter.location = () => compose(mounter, location())
  mounter.host = arg => compose(mounter, host(arg))
  mounter.module = arg => compose(mounter, module(arg))
  mounter.method = arg => compose(mounter, method(arg))

  return mounter
}


/**
 * NOTE: Not work in NodeJS
 *       Unable to get the host and port of the service
 */
export function location(): Mounter {
  return createMounter((ctx: Context) => {
    if (!ctx.request.url.host) return true
    if (isBrowser) {
      if (ctx.request.url.host === window.location.host) return true
    }
    return false
  })
}

/**
 * @param matcher glob or regexp
 */
export function pathname(matcher: string | RegExp): Mounter {
  return createMounter(ctx => {
    const pathname = ctx.url.pathname || '/'
    if (typeof matcher === 'string') return minimatch(pathname, matcher)
    return matcher.test(pathname)
  })
}

export function method(expectMethod: RequestMethod): Mounter {
  return createMounter(ctx => ctx.request.method === expectMethod)
}

export function host(host: string): Mounter {
  return createMounter(ctx => ctx.url.host === host)
}

export function module(moduleName: string): Mounter {
  if (moduleName === '') throw new Exception('Module name should not be empty')
  return createMounter(ctx => !!ctx.options.module && (ctx.options.module === moduleName || ctx.options.module.name === moduleName))
}


function compose(...mounters: Mounter[]): Mounter {
  return createMounter(ctx => {
    for (const mounter of mounters) {
      if (mounter(ctx)) continue
      return false
    }

    return true
  })
}
