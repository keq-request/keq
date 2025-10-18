/* eslint-disable @typescript-eslint/no-explicit-any */
import { Validator } from '~/validator/index.js'
import { KeqRouter } from '~/router/keq-router.js'
import { getLocationId } from './utils/index.js'
import { keqFetchMiddleware, keqTimeoutMiddleware, keqFlowControlMiddleware } from '~/middlewares/index.js'
import { KeqMiddleware } from '~/middleware/index.js'
import type { KeqRequest, KeqOperations } from './types/index.js'
import { Keq } from './keq.js'
import type { KeqGlobal } from '~/context/index.js'


interface CreateRequestOptions {
  initMiddlewares?: KeqMiddleware[]
  baseOrigin?: string
}

export function createRequest<OPERATIONS extends KeqOperations>(options?: CreateRequestOptions): KeqRequest<OPERATIONS> {
  let baseOrigin = options?.baseOrigin
  if (!baseOrigin) {
    if (Validator.isBrowser()) {
      baseOrigin = location.origin
    } else {
      baseOrigin = 'http://127.0.0.1'
    }
  }

  const appendMiddlewares: KeqMiddleware[] = options?.initMiddlewares ? [...options.initMiddlewares] : [
    keqFlowControlMiddleware(),
    keqTimeoutMiddleware(),
    keqFetchMiddleware(),
  ]

  const prependMiddlewares: KeqMiddleware[] = []

  /**
   * share data between requests, used to implement flowControl
   * @description 跨请求共享数据，用于实现 flowControl的功能
   */
  const global: KeqGlobal = {}

  const formatUrl = (url: string | URL): URL => {
    if (typeof url === 'string') {
      return new URL(url, baseOrigin)
    }

    return new URL(url.href)
  }

  const router = new KeqRouter(prependMiddlewares)

  const request: KeqRequest<OPERATIONS> = function (url, init) {
    const locationId = getLocationId(1)
    const keq = new Keq(formatUrl(url), { ...init, locationId, global })
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.baseOrigin = (origin) => {
    baseOrigin = origin
    return request
  }

  request.useRouter = function useRouter() {
    return router
  }

  request.get = function (url) {
    const locationId = getLocationId(1)
    const keq = new Keq(formatUrl(url), { method: 'get', locationId, global })
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.put = function (url) {
    const locationId = getLocationId(1)
    const keq = new Keq(formatUrl(url), { method: 'put', locationId, global })
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.delete = function (url) {
    const locationId = getLocationId(1)
    const keq = new Keq(formatUrl(url), { method: 'delete', locationId, global })
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.del = request.delete

  request.post = function (url) {
    const locationId = getLocationId(1)
    const keq = new Keq(formatUrl(url), { method: 'post', locationId, global })
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.head = function (url) {
    const locationId = getLocationId(1)
    const keq = new Keq(formatUrl(url), { method: 'head', locationId, global })
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.patch = function (url) {
    const locationId = getLocationId(1)
    const keq = new Keq(formatUrl(url), { method: 'patch', locationId, global })
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.options = function (url) {
    const locationId = getLocationId(1)
    const keq = new Keq(formatUrl(url), { method: 'options', locationId, global })
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.use = function use(middleware: KeqMiddleware, ...middlewares: KeqMiddleware[]): KeqRequest<OPERATIONS> {
    prependMiddlewares.push(middleware, ...middlewares)
    return request
  }

  return request
}
