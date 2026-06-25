import * as Handlebars from 'handlebars'
import { OpenAPIV3 } from 'openapi-types'


function isRef(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): schema is OpenAPIV3.ReferenceObject {
  return '$ref' in schema
}

Handlebars.registerHelper('h__is-ref', (schema: OpenAPIV3.ReferenceObject) => isRef(schema))

