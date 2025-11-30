import * as R from 'ramda'
import { Compiler } from '~/compiler/compiler.js'
import { Artifact } from '~/tasks/utils/artifact.js'
import { OperationDefinition } from '~/tasks/utils/operation-definition.js'
import { Plugin } from '~/types/plugin.js'
import { JsonSchemaUtils } from '~/utils/json-schema-utils/index.js'
import { OpenAPIV3_1 } from '@scalar/openapi-types'


export class BodyFallbackPlugin implements Plugin {
  apply(compiler: Compiler): void {
    compiler.hooks.afterCompileOperationRequest.tap(BodyFallbackPlugin.name, (artifact: Artifact, operationDefinition: OperationDefinition) => {
      const operation = operationDefinition.operation

      // const mediaTypes = Object.keys(operation.requestBody?.content || {})
      //   .filter((key) => key !== '*/*')

      // console.log('BodyFallbackPlugin mediaTypes:', mediaTypes)
      // let $mediaType: string | undefined = undefined

      // if (mediaTypes.length === 1) {
      //   const mediaType = mediaTypes[0]
      //   if (mediaType === 'application/json') $mediaType = '  req.type("application/json")'
      //   else if (mediaType === 'application/x-www-form-urlencoded') $mediaType = '  req.type("application/x-www-form-urlencoded")'
      //   else if (mediaType === 'multipart/form-data') $mediaType = '  req.type("multipart/form-data")'
      // } else if (mediaTypes.length > 1) {
      //   $mediaType = [
      //     '  req.appendMiddlewares(async (context, next) => {',
      //     '    const contentType = context.request.headers.get("Content-Type") || ""',
      //     '    if (!contentType) {',
      //     `       throw new Error("[Plugin ${BodyFallbackPlugin.name}] Cannot determine request body media type. Multiple media types are defined: ${mediaTypes.join(', ')}. Please set the Content-Type header explicitly.")`,
      //     '    }',
      //     '    await next()',
      //     '  })',
      //   ].join('\n')
      // }

      const parameters = operation.parameters?.filter((p): p is OpenAPIV3_1.ParameterObject => !JsonSchemaUtils.isRef(p)) || []
      const keys = parameters.map((p) => p.name).filter(R.isNotNil)

      const $acc = !keys.length
        ? '        acc[key] = args[key]'
        : [
          `        if (![${keys.map((k) => JSON.stringify(k)).join(', ')}].includes(key)) {`,
          '          acc[key] = args[key]',
          '        }',
        ].join('\n')

      artifact.anchor.block.replace('body', [
        // $mediaType ? `${$mediaType}\n` : undefined,
        '  if (typeof args === "object" && args !== null && !Array.isArray(args)) {',
        '    const requestBody = Object.keys(args)',
        '      .reduce((acc, key) => {',
        $acc,
        '        return acc',
        '      }, {} as Record<string, unknown>)',
        '',
        '    if (Object.keys(requestBody).length > 0) {',
        '      req.send(requestBody)',
        '    }',
        '  }',
      ].filter(R.isNotNil).join('\n'))

      return artifact
    })
  }
}
