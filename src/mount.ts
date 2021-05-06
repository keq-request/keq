import { MiddlewareMatcher } from './middleware'
import * as picomatch from 'picomatch'
import { Context } from './context'

interface Mounter extends MiddlewareMatcher {
  pathname(matcher: string | RegExp): Mounter
  location(): Mounter
  host(host: string): Mounter
  module(moduleName: string): Mounter
}


function createMounter(matcher: MiddlewareMatcher): Mounter {
  const mounter: Mounter = ctx => matcher(ctx)
  mounter.pathname = arg => compose(mounter, pathname(arg))
  mounter.location = () => compose(mounter, location())
  mounter.host = arg => compose(mounter, host(arg))
  mounter.module = arg => compose(mounter, module(arg))

  return mounter
}


export function location(): Mounter {
  return createMounter((ctx: Context) => !ctx.request.url.host)
}

export function pathname(matcher: string | RegExp): Mounter {
  return createMounter(ctx => {
    const pathname = ctx.url.pathname || '/'
    if (typeof matcher === 'string') return picomatch.isMatch(pathname, matcher)
    return matcher.test(pathname)
  })
}

export function host(host: string): Mounter {
  return createMounter(ctx => ctx.url.host === host)
}

export function module(moduleName: string): Mounter {
  if (moduleName === '') throw new Error('Module name should not be empty')
  return createMounter(ctx => ctx.options.module && ctx.options.module === moduleName)
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
