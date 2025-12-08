import { ApiDocumentV3_1, Artifact, Compiler, Plugin } from '@keq-request/cli'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'


interface Options {
  modules?: string[]
}

export class ValidateStatusCodePlugin implements Plugin {
  constructor(private options: Options = {}) {}

  apply(compiler: Compiler): void {
    if (this.options.modules && this.options.modules.length === 0) return

    // remove 4xx and 5xx responses from OpenAPI documents
    compiler.hooks.afterShaking.tap(ValidateStatusCodePlugin.name, () => {
      if (!compiler.context.shaken) return

      const documents = compiler.context.shaken.documents

      compiler.context.shaken.documents = documents.map((document: ApiDocumentV3_1): ApiDocumentV3_1 => {
        if (this.options.modules && !this.options.modules.includes(document.module.name)) {
          return document
        }

        const spec: OpenAPIV3_1.Document = document.specification

        if (!spec.paths || typeof spec.paths !== 'object' || spec.paths === null) return document

        const paths = Object.fromEntries(
          Object.entries(spec.paths)
            .map(([path, pathItem]) => {
              if (!pathItem || typeof pathItem !== 'object' || pathItem === null) return [path, pathItem]

              return [
                path,
                Object.fromEntries(
                  Object.entries(pathItem)
                    .map(([method, operation]) => {
                      if (!operation || typeof operation !== 'object' || operation === null) return [method, operation]

                      const responses = operation.responses
                      if (!responses) return [method, operation]

                      return [
                        method,
                        {
                          ...operation,

                          responses: Object.fromEntries(
                            Object.entries(responses)
                              .filter(([statusCode]) => parseInt(statusCode, 10) < 400),
                          ),
                        },
                      ]
                    }),
                ),
              ]
            }),
        )

        return new ApiDocumentV3_1({ ...spec, paths }, document.module)
      })
    })

    // inject validateStatusCode middleware into generated code
    compiler.hooks.afterCompileKeqRequest.tap(ValidateStatusCodePlugin.name, (artifact: Artifact) => {
      artifact.addDependence('@keq-request/exception', ['validateStatusCode'])

      if (!this.options.modules) {
        artifact.anchor.prepend('file:end', 'request.use(validateStatusCode())\n')
      } else {
        artifact.anchor.prepend(
          'file:end',
          [
            'request',
            '  .useRouter()',
            ...this.options.modules.map((moduleName) => `  .module(${JSON.stringify(moduleName)}, validateStatusCode())`),
            '',
          ].join('\n'),
        )
      }

      return artifact
    })
  }
}
