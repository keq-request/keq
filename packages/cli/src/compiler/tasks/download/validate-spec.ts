import { validate } from '@scalar/openapi-parser'
import { ModuleDefinition } from '~/models/index.js'
import { Exception } from '~/exception.js'

interface ValidateSpecOptions {
  moduleDefinition: ModuleDefinition
  tolerant: boolean
}

interface ValidateSpecResult {
  valid: boolean
  warning?: string
}

export async function validateSpec(
  spec: object,
  options: ValidateSpecOptions,
): Promise<ValidateSpecResult> {
  const { valid, errors } = await validate(spec)
  if (valid) return { valid: true }

  const errorLines = errors?.map((e) => {
    const path = (e as { path?: string }).path
    if (path) {
      const readablePath = path.replace(/~1/g, '/').replace(/~0/g, '~')
      return `  - ${e.message}\n    at: ${readablePath}`
    }
    return `  - ${e.message}`
  }).join('\n')

  let message = `${options.moduleDefinition.name} module openapi/swagger file does not conform to the openapi specifications or have grammatical errors, which may cause unexpected errors: \n${errorLines}`

  const hasInvalidRef = errors?.some((e) => e.message?.includes('Error-ModelName'))
  if (hasInvalidRef) {
    message += '\n\n  [Hint] "Error-ModelName" in $ref indicates that SpringDoc failed to resolve a Java class. Check that the referenced class (e.g. cn.dotfashion.soa.api.vo.Response) is on the classpath and properly annotated with @Schema.'
  }

  const hasExtensionsError = errors?.some((e) => e.message?.includes('Property extensions is not expected to be here'))
  if (hasExtensionsError) {
    message += '\n\n  [Hint] "Property extensions is not expected to be here" is typically caused by SpringDoc/Swagger wrapping x- extensions in an "extensions" object. Add SpringdocCompatPlugin to your config plugins to fix this automatically.'
  }

  if (options.tolerant) {
    return { valid: false, warning: message }
  }

  throw new Exception(options.moduleDefinition, message)
}
