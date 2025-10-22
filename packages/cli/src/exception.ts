import { CustomError } from 'ts-custom-error'
import wrap from 'word-wrap'
import { ModuleDefinition } from './tasks/utils/module-definition.js'


export class Exception extends CustomError {
  constructor(module: ModuleDefinition | string, message: string) {
    const moduleName = typeof module === 'string' ? module : module.name

    const msg = wrap(message, { width: 60, indent: '    ' })
    super(`${moduleName} module failed to compile:\n${msg}`)

    Object.defineProperty(this, 'name', { value: 'KeqCLI_Exception' })
  }
}
