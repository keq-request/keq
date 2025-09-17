import chalk from 'chalk'
import { compile } from './compile.js'
import { Exception } from './exception.js'
import { BuildOptions } from './types/build-options.js'
import { CompileOptions } from './types/compile-options.js'
import { FileNamingStyle } from './types/file-naming-style.js'


export async function build(options: BuildOptions): Promise<void> {
  const promises = Object.keys(options.modules)
    .map(async (moduleName): Promise<string> => {
      try {
        const compileOptions: CompileOptions = {
          esm: options.esm,
          outdir: options.outdir,
          strict: options.strict,
          request: options.request,
          fileNamingStyle: options.fileNamingStyle || FileNamingStyle.snakeCase,

          moduleName,
          document: options.modules[moduleName],
        }

        await compile(compileOptions)
        return moduleName
      } catch (e) {
        if (e instanceof Exception) {
          throw e
        } else if (e instanceof Error) {
          console.log(e)
          throw new Exception(moduleName, e.message)
        } else if (typeof e === 'string') {
          throw new Exception(moduleName, e)
        } else {
          throw e
        }
      }
    })

  const results = await Promise.allSettled(promises)

  for (const result of results) {
    if (result.status === 'rejected') {
      console.log(chalk.red(String(result.reason.message)))
    }
  }
}
