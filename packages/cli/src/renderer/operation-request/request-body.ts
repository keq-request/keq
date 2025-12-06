import * as R from 'ramda'
import { OperationDefinition } from '~/tasks/utils/operation-definition.js'
import { TypeNameFn } from '../operation-type/index.js'
import { OpenAPIV3_1 } from '@scalar/openapi-types'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { OpenapiUtils } from '~/utils/openapi-utils/index.js'
import { indent } from '../utils/generate-schema.js'
import { errorToComment } from './error-to-comment.js'


function requestBodyFormDataPropertyRenderer(
  propertyName: string,
  propertySchema: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject,
  mediaType: string,
  operationDefinition: OperationDefinition,
): string {
  try {
    const $propertyName = JSON.stringify(propertyName)

    const schema = JsonSchemaUtils.isRef(propertySchema)
      ? OpenapiUtils.dereferenceDeep<OpenAPIV3_1.SchemaObject>(propertySchema.$ref, operationDefinition.document.specification)
      : propertySchema

    if (
      (schema.type === 'string' && schema.format === 'binary')
      || schema.contentMediaType === 'application/octet-stream') {
      return `if (args && ${$propertyName} in args && args[${$propertyName}]) req.attach(${$propertyName}, args[${$propertyName}])`
    } else if (
      schema.type === 'string'
      || (schema.type === 'array' && schema.items && schema.items.type === 'string')
    ) {
      return `if (args && ${$propertyName} in args && args[${$propertyName}] !== undefined) req.field(${$propertyName}, args[${$propertyName}])`
    } else if (schema.type === 'number' || schema.type === 'integer') {
      return `if (args && ${$propertyName} in args && args[${$propertyName}] !== undefined) req.field(${$propertyName}, String(args[${$propertyName}]))`
    }

    return `if (args && ${$propertyName} in args && args[${$propertyName}] !== undefined) req.field(${$propertyName}, String(args[${$propertyName}]) /* type is non-string in schema; triggers type coercion here */)`
  } catch (err) {
    return errorToComment(err, mediaType)
  }
}

function requestBodyPropertyRenderer(
  propertyName: string,
  propertySchema: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject,
  mediaType: string,
  operationDefinition: OperationDefinition,
): string {
  if (mediaType === 'application/json') {
    const $propertyName = JSON.stringify(propertyName)
    return `if (args && ${$propertyName} in args) req.send({ ${$propertyName}: args[${$propertyName}] })`
  } else if (mediaType === 'multipart/form-data') {
    return requestBodyFormDataPropertyRenderer(propertyName, propertySchema, mediaType, operationDefinition)
  } else {
    throw new Error(`Unsupported media type: ${mediaType}`)
  }
}

export function requestBodyRenderer(operationDefinition: OperationDefinition, typeName: TypeNameFn): string {
  const { operation } = operationDefinition
  const requestBodyContent = (operation.requestBody?.content || {}) as Record<string, OpenAPIV3_1.MediaTypeObject>

  const $requestBody = Object.entries(requestBodyContent)
    .map(([mediaType, mediaTypeObject]): string | undefined => {
      if (!mediaTypeObject.schema) return

      try {
        const schema = JsonSchemaUtils.isRef(mediaTypeObject.schema)
          ? OpenapiUtils.dereferenceDeep<OpenAPIV3_1.SchemaObject>(mediaTypeObject.schema.$ref, operationDefinition.document.specification)
          : mediaTypeObject.schema

        if (schema.type !== 'object') return

        const properties = (schema.properties || {}) as OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject

        return Object.entries(properties)
          .map(([propertyName, propertySchema]) => {
            return indent(
              2,
              requestBodyPropertyRenderer(propertyName, propertySchema, mediaType, operationDefinition),
            )
          })
          .join('\n')
      } catch (err) {
        return indent(2, errorToComment(err, mediaType))
      }
    })
    .filter(R.isNotNil)
    .join('\n')

  return $requestBody
}
