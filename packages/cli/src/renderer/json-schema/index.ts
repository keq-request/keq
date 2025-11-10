import { SchemaDefinition } from '~/tasks/utils/schema-definition.js'
import { generateComment, generateSchema } from '../utils/generate-schema.js'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'


// eslint-disable-next-line @typescript-eslint/require-await
export async function jsonSchemaRenderer(schemaDefinition: SchemaDefinition): Promise<string> {
  let $comment = generateComment(schemaDefinition.schema)
  if ($comment) $comment += '\n'

  if (typeof schemaDefinition.schema === 'boolean') {
    return `${$comment}type ${schemaDefinition.name} = unknown`
  }

  if (JsonSchemaUtils.isNonArray(schemaDefinition.schema) && schemaDefinition.schema.type === 'object') {
    return `${$comment}export interface ${schemaDefinition.name} ${generateSchema(schemaDefinition.schema)}`
  }

  return `${$comment}export type ${schemaDefinition.name} = ${generateSchema(schemaDefinition.schema)}`
}
