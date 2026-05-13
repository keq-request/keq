import Router from 'find-my-way'
import type { IncomingMessage, ServerResponse } from 'http'
import type { MockRouteStore } from './types.js'


export type MockRouter = Router.Instance<Router.HTTPVersion.V1>

export function createMockRouter(): MockRouter {
  return Router({
    defaultRoute(_req: IncomingMessage, res: ServerResponse) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Not Found', message: 'No matching mock route' }))
    },
  })
}

export function convertOpenApiPath(openapiPath: string): string {
  return openapiPath.replace(/\{([^}]+)}/g, ':$1')
}

export function registerRoute(
  router: MockRouter,
  method: string,
  openapiPath: string,
  store: MockRouteStore,
): void {
  const path = convertOpenApiPath(openapiPath)
  const httpMethod = method.toUpperCase() as Router.HTTPMethod

  router.on(httpMethod, path, (_req, _res, _params, s: MockRouteStore) => s, store)
}
