import { OpenAPIV3 } from 'openapi-types'
import { dereference } from './dereference.js'

export function removeUnnecessaryRef(doc: OpenAPIV3.Document): void {
  for (const path in doc.paths) {
    if (!doc.paths[path]) continue

    const pathItem: OpenAPIV3.PathItemObject = ('$ref' in doc.paths[path] && doc.paths[path].$ref) ? dereference(doc, doc.paths[path].$ref) : doc.paths[path]
    if (!pathItem) continue
    doc.paths[path] = pathItem

    for (const method in pathItem) {
      if (['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'trace'].indexOf(method.toLowerCase()) === -1) continue

      const operation: OpenAPIV3.OperationObject = pathItem[method]

      if (operation.requestBody) {
        const requestBody = '$ref' in operation.requestBody ? dereference(doc, operation.requestBody.$ref) : operation.requestBody
        operation.requestBody = requestBody
      }


      for (const code in operation.responses) {
        if (!operation.responses[code]) continue

        const response: OpenAPIV3.ResponseObject = '$ref' in operation.responses[code] ? dereference(doc, operation.responses[code].$ref) : operation.responses[code]
        operation.responses[code] = response

        for (const header in response.headers) {
          if (!response.headers[header]) continue

          const headerObject = '$ref' in response.headers[header] ? dereference(doc, response.headers[header].$ref) : response.headers[header]
          response.headers[header] = headerObject
        }
      }

      if (Array.isArray(operation.parameters)) {
        operation.parameters = operation.parameters.map((parameter) => ('$ref' in parameter ? dereference(doc, parameter.$ref) : parameter))
      }
    }
  }
}
