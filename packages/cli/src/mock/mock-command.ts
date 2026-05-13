import { Compiler } from '~/compiler/compiler.js'
import { MockGenerator } from './mock-generator.js'
import { MockServer } from './mock-server.js'
import { createMockRouter, registerRoute } from './mock-router.js'
import { formatRouteTable } from './format-route-table.js'
import type { MockGenerateOptions, MockServerOptions, RouteTableEntry } from './types.js'
import { logger } from '~/utils/logger.js'


interface MockCommandOptions {
  config?: string
  port: string
  host: string
  module?: string[]
  cors: boolean
  delay?: string
  debug?: boolean
  tolerant?: boolean
  maxDepth?: string
  refDepth?: string
}

function parseDelay(delay?: string): MockServerOptions['delay'] {
  if (!delay) return undefined

  if (delay.includes('-')) {
    const [min, max] = delay.split('-').map(Number)
    if (!isNaN(min) && !isNaN(max)) return { min, max }
  }

  const ms = parseInt(delay, 10)
  if (!isNaN(ms)) return ms

  return undefined
}

export async function mockCommand(options: MockCommandOptions): Promise<void> {
  const compiler = new Compiler({
    build: false,
    persist: false,
    silent: true,
    config: options.config,
    debug: !!options.debug,
    tolerant: !!options.tolerant,
  })

  await compiler.run()

  const documents = compiler.context.documents || []

  if (documents.length === 0) {
    throw new Error('No API documents found. Check your keq configuration.')
  }

  const router = createMockRouter()
  const generators = new Map<string, MockGenerator>()
  const routeEntries: RouteTableEntry[] = []
  let routeCount = 0

  const generateOptions: MockGenerateOptions = {
    maxDepth: parseInt(options.maxDepth || '10', 10),
    refDepthMax: parseInt(options.refDepth || '3', 10),
  }

  const matcher = compiler.context.matcher

  for (const document of documents) {
    const moduleName = document.module.name

    if (options.module && !options.module.includes(moduleName)) {
      continue
    }

    const generator = new MockGenerator(document, generateOptions)
    generators.set(moduleName, generator)

    for (const operation of document.operations) {
      if (matcher?.isOperationDenied(operation)) continue

      const responses = generator.buildResponses(operation)
      if (responses.length === 0) continue

      registerRoute(router, operation.method, operation.pathname, {
        moduleName,
        operationId: operation.operationId,
        responses,
      })
      routeEntries.push({
        moduleName,
        method: operation.method.toUpperCase(),
        pathname: operation.pathname,
        operationId: operation.operationId,
      })
      routeCount++
    }
  }

  if (routeCount === 0) {
    throw new Error('No routes registered. Check your API specifications.')
  }

  const serverOptions: MockServerOptions = {
    port: parseInt(options.port, 10),
    host: options.host,
    cors: options.cors,
    delay: parseDelay(options.delay),
  }

  const server = new MockServer(router, generators, serverOptions)
  await server.start()

  logger.log(`${routeCount} routes registered from ${generators.size} module(s)`)
  logger.log('')
  logger.raw(formatRouteTable(routeEntries))
  logger.log(`Mock server running at http://${serverOptions.host}:${serverOptions.port}`)

  process.on('SIGINT', () => {
    logger.log('\nShutting down mock server...')
    void server.stop().then(() => process.exit(0))
  })

  process.on('SIGTERM', () => {
    void server.stop().then(() => process.exit(0))
  })
}
