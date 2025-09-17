
import * as Handlebars from 'handlebars'
import { OpenAPIV3 } from 'openapi-types'
import { dereference } from '../utils/dereference.js'


Handlebars.registerHelper('h__dereference', (schema: OpenAPIV3.ReferenceObject, options: Handlebars.HelperOptions) => {
  const ref = schema
  const document = options.data.root.document

  return dereference(document, ref.$ref)
})
