import type { JsonSchema } from 'json-schema-faker'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import type { ApiDocumentV3_1 } from '~/models/api-document_v3_1.js'
import type { OperationDefinition } from '~/models/operation-definition.js'
import type { MockGenerateOptions, MockRouteResponse } from './types.js'
import { logger } from '~/utils/logger.js'


export class MockGenerator {
  private document: ApiDocumentV3_1
  private options: MockGenerateOptions

  constructor(document: ApiDocumentV3_1, options: MockGenerateOptions) {
    this.document = document
    this.options = options
  }

  buildResponses(operation: OperationDefinition): MockRouteResponse[] {
    const responses = operation.operation.responses || {}
    const result: MockRouteResponse[] = []

    for (const [statusCode, responseOrRef] of Object.entries(responses)) {
      const response = this.resolveResponse(responseOrRef)
      if (!response) continue

      const content = response.content
      if (!content) {
        result.push({ statusCode, contentType: 'application/json' })
        continue
      }

      for (const [contentType, mediaType] of Object.entries(content)) {
        const mockResponse: MockRouteResponse = {
          statusCode,
          contentType,
          schema: mediaType.schema,
        }

        if (mediaType.example !== undefined) {
          mockResponse.example = mediaType.example
        }

        if (mediaType.examples) {
          mockResponse.examples = Object.fromEntries(
            Object.entries(mediaType.examples)
              .map(([name, exampleOrRef]): [string, unknown] => {
                if ('$ref' in exampleOrRef) return [name, undefined]
                return [name, exampleOrRef.value]
              })
              .filter(([, v]) => v !== undefined),
          )
        }

        result.push(mockResponse)
      }
    }

    return result
  }

  async generateData(response: MockRouteResponse, exampleName?: string): Promise<unknown> {
    if (exampleName && response.examples?.[exampleName] !== undefined) {
      return response.examples[exampleName]
    }

    if (response.example !== undefined) {
      return response.example
    }

    if (response.examples) {
      const firstExample = Object.values(response.examples)[0]
      if (firstExample !== undefined) return firstExample
    }

    if (!response.schema) return null

    const schema = this.resolveSchema(response.schema)
    const { generate } = await import('json-schema-faker')
    return generate(schema, {
      alwaysFakeOptionals: true,
      useExamplesValue: true,
      maxDepth: this.options.maxDepth,
      refDepthMax: this.options.refDepthMax,
      refResolver: (ref) => this.resolveRef(ref),
    })
  }

  private resolveResponse(responseOrRef: OpenAPIV3_1.ResponseObject | OpenAPIV3_1.ReferenceObject): OpenAPIV3_1.ResponseObject | undefined {
    if ('$ref' in responseOrRef) {
      const definition = this.document.dereference(responseOrRef.$ref)
      if (!definition) return undefined
      if ('response' in definition) return definition.response
      return undefined
    }
    return responseOrRef
  }

  private resolveSchema(schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject): OpenAPIV3_1.SchemaObject {
    if ('$ref' in schema) {
      const refPath = schema.$ref.replace('#/', '').split('/').map(decodeURIComponent)
      let resolved: unknown = this.document.specification
      for (const segment of refPath) {
        resolved = (resolved as Record<string, unknown>)?.[segment]
      }
      if (!resolved) {
        logger.warn(`Unable to resolve schema $ref: ${schema.$ref}`)
      }
      return (resolved as OpenAPIV3_1.SchemaObject) || {}
    }
    return schema
  }

  private resolveRef(ref: string): JsonSchema {
    const refPath = ref.replace('#/', '').split('/').map(decodeURIComponent)
    let resolved: unknown = this.document.specification
    for (const segment of refPath) {
      resolved = (resolved as Record<string, unknown>)?.[segment]
    }
    if (!resolved) {
      logger.warn(`Unable to resolve $ref: ${ref}`)
    }
    return (resolved as JsonSchema) || {}
  }
}
