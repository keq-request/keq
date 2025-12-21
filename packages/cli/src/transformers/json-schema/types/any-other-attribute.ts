/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import type { OpenAPIV3 } from '@scalar/openapi-types'

type ExtractAnyOtherAttribute<T> = T extends (OpenAPIV3.ArraySchemaObject | OpenAPIV3.NonArraySchemaObject) & infer M ? M : never
export type AnyOtherAttribute = ExtractAnyOtherAttribute<OpenAPIV3.SchemaObject>
