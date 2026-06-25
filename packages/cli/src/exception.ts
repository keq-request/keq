import { CustomError } from 'ts-custom-error'
import wrap from 'word-wrap'


export class Exception extends CustomError {
  constructor(moduleName: string, message: string) {
    const msg = wrap(message, { width: 60, indent: '    ' })
    super(`${moduleName} module failed to compile:\n${msg}`)

    Object.defineProperty(this, 'name', { value: 'KeqCLI_Exception' })
  }
}
