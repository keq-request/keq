import { CompileOpenapiOptions } from './types/compile-openapi-options.js'
import { CompileOpenapi } from './compile-openapi.js'
import { CompileOptions } from './types/compile-options.js'
import { FileNamingStyle } from './types/file-naming-style.js'


export async function compile(options: CompileOptions): Promise<void> {
  const compileOpenapiOptions: CompileOpenapiOptions = {
    ...options,
    fileNamingStyle: options.fileNamingStyle || FileNamingStyle.snakeCase,
  }

  await CompileOpenapi(compileOpenapiOptions)
}
