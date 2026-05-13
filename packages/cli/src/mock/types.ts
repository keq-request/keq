import type { OpenAPIV3_1 } from '@scalar/openapi-types'


export interface MockServerOptions {
  port: number
  host: string
  cors: boolean
  delay?: number | { min: number; max: number }
}

export interface MockRouteResponse {
  statusCode: string
  contentType: string
  schema?: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject
  example?: unknown
  examples?: Record<string, unknown>
}

export interface MockGenerateOptions {
  maxDepth: number
  refDepthMax: number
}

export interface MockRouteStore {
  moduleName: string
  operationId: string
  responses: MockRouteResponse[]
}

export interface RouteTableEntry {
  moduleName: string
  method: string
  pathname: string
  operationId: string
}
