import { CompileOptions } from './compile-options.js'
import { OpenAPIV3 } from 'openapi-types'


export interface CompileOpenapiOptions extends Omit<CompileOptions, 'filepath'> {
  document: OpenAPIV3.Document
}
