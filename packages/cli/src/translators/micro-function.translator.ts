import { GenerateDeclarationPlugin, GenerateMicroFunctionPlugin } from '~/plugins/index.js'
import { Translator, Plugin } from '~/types/index.js'


export class MicroFunctionTranslator implements Translator {
  apply(): Plugin[] {
    return [
      new GenerateDeclarationPlugin(),
      new GenerateMicroFunctionPlugin(),
    ]
  }
}
