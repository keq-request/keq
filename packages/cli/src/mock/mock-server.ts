import * as http from 'http'
import type Router from 'find-my-way'
import type { MockServerOptions, MockRouteStore, MockRouteResponse } from './types.js'
import type { MockRouter } from './mock-router.js'
import type { MockGenerator } from './mock-generator.js'
import { logger } from '~/utils/logger.js'


export class MockServer {
  private server: http.Server | null = null
  private router: MockRouter
  private generators: Map<string, MockGenerator>
  private options: MockServerOptions

  constructor(
    router: MockRouter,
    generators: Map<string, MockGenerator>,
    options: MockServerOptions,
  ) {
    this.router = router
    this.generators = generators
    this.options = options
  }

  async start(): Promise<void> {
    this.server = http.createServer((req, res) => {
      void this.handleRequest(req, res)
    })

    return new Promise((resolve, reject) => {
      this.server!.listen(this.options.port, this.options.host, () => {
        resolve()
      })
      this.server!.on('error', reject)
    })
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve())
      } else {
        resolve()
      }
    })
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

    if (this.options.cors) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', '*')
      res.setHeader('Access-Control-Allow-Headers', '*')

      if (req.method === 'OPTIONS') {
        res.statusCode = 204
        res.end()
        return
      }
    }

    const found = this.router.find(
      req.method as Router.HTTPMethod,
      url.pathname,
    )

    if (!found) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Not Found', message: 'No matching mock route' }))
      return
    }

    const store = found.store as MockRouteStore
    const generator = this.generators.get(store.moduleName)
    if (!generator) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Internal Error', message: `Generator not found for module: ${store.moduleName}` }))
      return
    }

    const targetStatus = url.searchParams.get('__status')
    const exampleName = url.searchParams.get('__example') || undefined
    const delayOverride = url.searchParams.get('__delay')

    const response = this.selectResponse(store, targetStatus)
    if (!response) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Internal Error', message: 'No response definition found' }))
      return
    }

    const delay = delayOverride
      ? parseInt(delayOverride, 10)
      : this.computeDelay()

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    let body: unknown
    try {
      body = await generator.generateData(response, exampleName)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error generating mock data'
      logger.error(`Failed to generate mock data for ${req.method} ${url.pathname}: ${message}`)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
        error: 'Mock Generation Error',
        message: `Failed to generate mock data: ${message}`,
      }))
      return
    }

    const statusCode = parseInt(response.statusCode, 10) || 200

    res.statusCode = statusCode
    const contentType = (!response.contentType || response.contentType.includes('*'))
      ? 'application/json'
      : response.contentType
    res.setHeader('Content-Type', contentType)
    res.end(JSON.stringify(body))

    logger.log(`${req.method} ${url.pathname} -> ${statusCode}`)
  }

  private selectResponse(store: MockRouteStore, targetStatus: string | null): MockRouteResponse | undefined {
    if (targetStatus) {
      return store.responses.find((r) => r.statusCode === targetStatus)
        || store.responses[0]
    }

    const success = store.responses.find((r) => r.statusCode.startsWith('2'))
    return success || store.responses[0]
  }

  private computeDelay(): number {
    if (!this.options.delay) return 0

    if (typeof this.options.delay === 'number') {
      return this.options.delay
    }

    const { min, max } = this.options.delay
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}
