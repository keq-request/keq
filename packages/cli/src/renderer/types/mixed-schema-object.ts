
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { AnyOtherAttribute } from './any-other-attribute.js'

type ExtractSchemaObject<T> = T extends (infer M & AnyOtherAttribute) ? M : never
type SchemaObject = ExtractSchemaObject<OpenAPIV3_1.SchemaObject>

export type MixedSchemaObject = Exclude<SchemaObject, boolean | OpenAPIV3_1.NonArraySchemaObject | OpenAPIV3_1.ArraySchemaObject>
